let currentPosition = {
  chapterPath: null,
  anchor: null,
  pageNo: 1,
  pageCount: 1,

  gapWidth: null,
  pageWidth: null,
};

const DEBOUNCE_DELAY = 150;
let skipWheelEvent = false;

$(document).on('click', 'a', function onclick(event) {
  event.preventDefault();
  const a = $(this)[0];

  const chapterPath = a.pathname.slice(1);

  const anchor = a.hash;
  if (a.protocol === location.protocol && a.host === location.host) {
    MESSAGE_HANDLERS.setPath({
      chapterPath,
      anchor,
    });
  } else {
    postWebMessage({
      action: 'openExternal',
      url: a.href,
    });
  }
});

function updatePageCount() {
  const $m = $('main#main');
  const $c = $('main#main>#content');
  const c = $c[0];
  const gapWidth = parseFloat($c.css('column-gap')) || $m.width() * 0.02;
  const pageWidth = c.clientWidth + gapWidth;
  const pageCount = Math.floor(c.scrollWidth / pageWidth + 0.7);
  currentPosition = _.merge(currentPosition, {
    gapWidth,
    pageWidth,
    pageCount,
  });
}

function setPageNo(page) {
  const p = isNaN(page) ? 1 : page;
  currentPosition.pageNo = Math.max(
    1,
    Math.min(currentPosition.pageCount, p || 1)
  );
  $('main#main>#content').css({
    left: -currentPosition.pageWidth * (currentPosition.pageNo - 1),
  });
  updateProgress();
}

function goToPage({
  anchor,
  pageNo,
  pageCount,
}) {
  let toPage = 1;
  if (anchor && anchor.length) {
    const a = $(anchor)[0];
    if (a) {
      toPage = ((a.offsetLeft / currentPosition.pageWidth) | 0) + 1;
    }
  } else if (pageNo === 1 || pageNo === -1) {
    toPage = pageNo === 1 ? 1 : currentPosition.pageCount;
  } else if (pageNo && pageCount) {
    toPage = ((pageNo / pageCount) * currentPosition.pageCount) | 0;
  }
  setPageNo(toPage);
}

function updateProgress() {
  const {
    chapterPath,
    anchor,
    pageNo,
    pageCount,
  } = currentPosition;
  postWebMessage({
    action: 'updateProgress',
    progress: {
      chapterPath,
      anchor,
      pageNo,
      pageCount,
    },
  });
  $('#main').focus();
  setTimeout(() => {
    skipWheelEvent = false;
  }, DEBOUNCE_DELAY);
}

$(window).resize(
  _.debounce(() => {
    updatePageCount();
    setPageNo(currentPosition.pageNo);
  }, DEBOUNCE_DELAY)
);

function switchPage(delta) {
  skipWheelEvent = true;
  const page = (currentPosition.pageNo | 0) + delta;
  if (page < 1 || page > currentPosition.pageCount) {
    postWebMessage({
      action: 'switchPage',
      delta,
    });
  } else {
    setPageNo(page);
  }
}

function pageUp() {
  switchPage(-1);
}

function pageDown() {
  switchPage(+1);
}

$(() => {
  updatePageCount();
  postWebMessage({
    action: 'ready',
    bookId: location.hostname.slice(4),
  });

  const onWheelTrigger = _.debounce(
    delta => {
      if (delta > 0) {
        pageUp();
      } else if (delta < 0) {
        pageDown();
      }
    },
    DEBOUNCE_DELAY, {
      leading: true,
      trailing: false,
    }
  );

  $('body')
    .on('mousewheel', e => {
      e.preventDefault();
      if (skipWheelEvent) return;
      onWheelTrigger(e.originalEvent.wheelDelta);
    })
    .on('keyup', e => {
      switch (e.which) {
        case 33: // page up
        case 38: // up
        case 37: // left
          pageUp();
          break;
        case 34: // page down
        case 40: // down
        case 39: // right
        case 32: // space
        case 13: // enter
          pageDown();
          break;
        default:
      }
    });
});

function messageHandler(event) {
  const {
    data,
  } = event;

  const {
    channel,
    action,
  } = data;
  if (channel !== 'ebook') return;

  delete data.channel;
  delete data.action;
  if (MESSAGE_HANDLERS[action]) MESSAGE_HANDLERS[action](data);
}

window.addEventListener('message', messageHandler, false);

function styleMapToLines(styles) {
  return _.map(styles, (value, key) => `  ${key}: ${value} !important;`);
}

const MESSAGE_HANDLERS = {
  setPath({
    chapterPath,
    anchor,
    pageNo,
    pageCount,
  }) {
    if (chapterPath === currentPosition.chapterPath) {
      goToPage({
        anchor,
        pageNo,
        pageCount,
      });
      return;
    }

    $('main#main').removeClass('show');
    $.get(`/${chapterPath}`).then(xhtml => {
      $('#dialog-container').empty();
      $('head>base').attr('href', `/${chapterPath}`);
      const $doc = $(xhtml);
      const $head = $doc.find('head');
      const $body = $doc.find('body');

      $body.find('script').remove();
      $head.find('style,link').prependTo($body);

      currentPosition.chapterPath = chapterPath;
      $('main#main>#content').html($body.children());

      setTimeout(() => {
        updatePageCount();
        goToPage({
          anchor,
          pageNo,
          pageCount,
        });
        $('main#main').addClass('show');
      }, 1);
      return null;
    }).catch(() => {});
  },

  setPage({
    page,
  }) {
    setPageNo(page);
  },

  updateCss({
    styles,
  }) {
    const {
      bodyStyles,
      linkStyles,
      allStyles,
    } = styles;
    const bodyLines = styleMapToLines(bodyStyles).join('\n');
    const linkLines = styleMapToLines(linkStyles).join('\n');
    const allLines = styleMapToLines(allStyles).join('\n');

    document.getElementById('dyn-css-pre').innerText = `
html, body {
${bodyLines}
}

* {
  font-family: ${bodyStyles['font-family']};
  color: ${bodyStyles.color};
  background-color: ${bodyStyles['background-color']};
}

* {
${allLines}
}

a {
${linkLines}
}

a * {
${linkLines}
}
`;
    setTimeout(() => {
      updatePageCount();
      setPageNo(currentPosition.pageNo);
    }, 1);
  },

  showToast({
    message,
  }) {
    const $t = $('<dialog>').text(message);
    $('body>#dialog-container').append($t);
    setTimeout(() => {
      $t.remove();
    }, 4000);
  },
};

function postWebMessage(data) {
  window.parent.postMessage(
    _.merge({
        channel: 'ebook',
      },
      data
    ),
    '*'
  );
}
