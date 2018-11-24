import _ from 'lodash';
import React, { PureComponent } from 'react';
import { Dropdown } from 'semantic-ui-react';
import SystemFonts from 'system-font-families';

let cachedFonts = null;

function mergeFonts(fonts) {
  return _.uniq(fonts.map(({ family }) => family)).sort((f1, f2) =>
    f1 < f2 ? -1 : 1
  );
}

async function fetchFonts() {
  if (cachedFonts) return cachedFonts;
  const systemFonts = new SystemFonts();
  cachedFonts = await systemFonts.getFonts();
  return cachedFonts;
}

class FontPicker extends PureComponent {
  constructor(props) {
    super(props);
    const { font } = props;
    this.state = {
      fonts: cachedFonts || [font],
      selected: font,
      loading: true,
    };
    this.updateFonts();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.font) {
      this.setState({ selected: nextProps.font });
    }
  }

  async updateFonts() {
    const fonts = await fetchFonts();
    this.setState(() => ({ fonts, loading: false }));
  }

  onChanged(selected) {
    const { onChange = null } = this.props;

    const oldSelected = this.state.selected;
    if (selected === oldSelected) return;
    this.setState({ selected });
    if (onChange) onChange(selected);
  }

  render() {
    const { fonts, selected, loading } = this.state;
    return (
      <Dropdown
        search
        fluid
        className="selection"
        loading={loading}
        value={selected}
        text={selected}
        style={{ fontFamily: selected }}
      >
        <Dropdown.Menu>
          {fonts.map(font => (
            <Dropdown.Item
              key={font}
              style={{ fontFamily: font }}
              onClick={() => this.onChanged(font)}
            >
              {font}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export default FontPicker;
