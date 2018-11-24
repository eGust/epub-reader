import _ from 'lodash';
import React, { PureComponent } from 'react';
import { Icon, Header, Modal } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { ShelfMenu, ShelfBody } from '../containers/shelf_containers';
import { ReaderMenu, ReaderBody } from '../containers/reader_containers';
import { Settings } from '../containers/settings_containers';

let droot;

const Dimmer = ({ show, content }) => (
  <div className={show ? 'waiting-dimmer' : 'waiting-dimmer hide'}>
    <h1>
      <Icon loading name="spinner" size="massive" />
      {content}
    </h1>
  </div>
);

class App extends PureComponent {
  state = {
    dragging: false,
    viewMargin: 0,
    bookMargin: 0,
    customMargin: false,
  };

  componentDidMount() {
    droot = document.getElementById('root');
    this.updateSize();
    window.addEventListener('resize', () => this.updateSize());
  }

  updateSize() {
    const w = droot.clientWidth;
    if (w < 1300) {
      this.setState({ customMargin: false });
      return;
    }
    const cnt = Math.floor(w / 310);

      
const bookMargin = Math.floor((w - 40 - 240 * cnt) / (cnt * 10)) * 10;

      
const viewMargin = (w - (240 + bookMargin) * cnt) / 2 - 10;

    this.setState({
      customMargin: true,
      viewMargin,
      bookMargin,
    });
  }

  render() {
    const { dragging, ...margins } = this.state;

      
const { routing, showSettings, reader, shelf, openBookFiles } = this.props;
    // customMargin, viewMargin, bookMargin, bookCovers,

    const onPreventDefault = e => {
        e.preventDefault();
        e.stopPropagation();
      };

      
const onDragStart = e => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ dragging: true });
      };

      
const onDragEnd = e => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ dragging: false });
      };

      
const onDrop = e => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({ dragging: false });
        openBookFiles(_.map(e.dataTransfer.files, f => f.path));
      };

    return (
      <div className="App" onDragEnterCapture={onDragStart}>
        <div className={routing === 'shelf' ? 'full-size' : 'hide'}>
          <ShelfMenu />
          <ShelfBody {...margins} />
          <Dimmer show={shelf.opening} content="Opening..." />
        </div>

        <div className={routing === 'reader' ? 'full-size' : 'hide'}>
          <ReaderMenu />
          <ReaderBody
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDrop={onDrop}
          />
          <Dimmer show={reader.opening} content="Opening..." />
        </div>

        <Settings showSettings={showSettings} />

        <div className={dragging ? 'dragging-wrap' : 'hide'}>
          <Icon
            name="file text"
            className="file-icon"
            style={{ color: 'gray' }}
          />
          <Icon
            name="level down"
            className="file-icon"
            style={{ color: 'black', marginLeft: '10vw' }}
          />
          <div
            id="dragging-file"
            className="dragging"
            onDragOverCapture={onPreventDefault}
            onDragEnterCapture={onPreventDefault}
            onDragCapture={onPreventDefault}
            onDragStartCapture={onPreventDefault}
            onDragEndCapture={onDragEnd}
            onDragLeaveCapture={onDragEnd}
            onDropCapture={onDrop}
          />
        </div>
      </div>
    );
  }
}

const exported = { App };

export default exported;
