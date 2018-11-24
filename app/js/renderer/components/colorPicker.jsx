import _ from 'lodash';
import React from 'react';
import { Icon, Popup, Button } from 'semantic-ui-react';
import { Hue, Saturation } from 'react-color/lib/components/common';
import Color from 'react-color/lib/helpers/color';

export class ColorPicker extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activePanel: 'material',
      color: Color.toState(props.color || '#88F', 0)
    };
  }

  onChanged(color) {
    const { onChange } = this.props,
      newColor = Color.toState(color, 0);
    if (newColor.hex === this.state.color.hex) return;
    this.setState({ color: newColor });
    onChange && onChange(newColor);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.color) {
      this.setState({ color: Color.toState(nextProps.color, 0) });
    }
  }

  render() {
    const {
        activePanel,
        color: { hsl, hsv, hex }
      } = this.state,
      upHex = hex.toUpperCase();
    return (
      <Popup
        on="click"
        trigger={
          <div className="color-picker-box">
            <div className="color-box" style={{ backgroundColor: upHex }} />
            <Icon name="caret down" className="caret" />
          </div>
        }
      >
        <div className="color-picker-popup">
          <div
            className={activePanel === 'material' ? 'material panel' : 'hide'}
          >
            {activePanel === 'material'
              ? _.map(COLORS, (row, index) => (
                  <div key={index} className="column">
                    {_.map(row, (colorStyles, index) => (
                      <div
                        key={index}
                        className={
                          colorStyles.backgroundColor === upHex
                            ? 'selected item'
                            : 'item'
                        }
                        style={{
                          ...colorStyles,
                          borderColor: colorStyles.color
                        }}
                        onClick={() =>
                          this.onChanged(colorStyles.backgroundColor)
                        }
                      >
                        <Icon name="check" />
                      </div>
                    ))}
                  </div>
                ))
              : null}
            <div
              className={
                '#FFFFFF' === upHex
                  ? 'selected special item white'
                  : 'special item white'
              }
              onClick={() => this.onChanged('#FFFFFF')}
            >
              <Icon name="check" />
            </div>
            <div
              className={
                '#000000' === upHex
                  ? 'selected special item black'
                  : 'special item black'
              }
              onClick={() => this.onChanged('#000000')}
            >
              <Icon name="check" />
            </div>
            <Button
              className="switch-button"
              basic
              icon
              onClick={() => this.setState({ activePanel: 'free' })}
            >
              <Icon name="exchange" />
            </Button>
          </div>

          <div className={activePanel === 'free' ? 'free panel' : 'hide'}>
            {activePanel === 'free' ? (
              <div className="saturation pane">
                <Saturation
                  hsl={hsl}
                  hsv={hsv}
                  onChange={color => this.onChanged(color)}
                />
              </div>
            ) : null}
            <div className="hue pane">
              <Button
                className="switch-button"
                basic
                icon
                onClick={() => this.setState({ activePanel: 'material' })}
              >
                <Icon name="exchange" />
              </Button>
              {activePanel === 'free' ? (
                <div className="hue-wrap">
                  <Hue hsl={hsl} onChange={color => this.onChanged(color)} />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Popup>
    );
  }
}

const COLORS = _.map(
  {
    Brown: {
      '50': { color: '#EFEBE9', text: 'black' },
      '100': { color: '#D7CCC8', text: 'black' },
      '200': { color: '#BCAAA4', text: 'black' },
      '300': { color: '#A1887F', text: 'white' },
      '400': { color: '#8D6E63', text: 'white' },
      '500': { color: '#795548', text: 'white' },
      '600': { color: '#6D4C41', text: 'white' },
      '700': { color: '#5D4037', text: 'white' },
      '800': { color: '#4E342E', text: 'white' },
      '900': { color: '#3E2723', text: 'white' }
    },
    'Blue Grey': {
      '50': { color: '#ECEFF1', text: 'black' },
      '100': { color: '#CFD8DC', text: 'black' },
      '200': { color: '#B0BEC5', text: 'black' },
      '300': { color: '#90A4AE', text: 'black' },
      '400': { color: '#78909C', text: 'white' },
      '500': { color: '#607D8B', text: 'white' },
      '600': { color: '#546E7A', text: 'white' },
      '700': { color: '#455A64', text: 'white' },
      '800': { color: '#37474F', text: 'white' },
      '900': { color: '#263238', text: 'white' }
    },
    Grey: {
      '50': { color: '#FAFAFA', text: 'black' },
      '100': { color: '#F5F5F5', text: 'black' },
      '200': { color: '#EEEEEE', text: 'black' },
      '300': { color: '#E0E0E0', text: 'black' },
      '400': { color: '#BDBDBD', text: 'black' },
      '500': { color: '#9E9E9E', text: 'black' },
      '600': { color: '#757575', text: 'white' },
      '700': { color: '#616161', text: 'white' },
      '800': { color: '#424242', text: 'white' },
      '900': { color: '#212121', text: 'white' }
    },
    Red: {
      '50': { color: '#FFEBEE', text: 'black' },
      '100': { color: '#FFCDD2', text: 'black' },
      '200': { color: '#EF9A9A', text: 'black' },
      '300': { color: '#E57373', text: 'black' },
      '400': { color: '#EF5350', text: 'white' },
      '500': { color: '#F44336', text: 'white' },
      '600': { color: '#E53935', text: 'white' },
      '700': { color: '#D32F2F', text: 'white' },
      '800': { color: '#C62828', text: 'white' },
      '900': { color: '#B71C1C', text: 'white' },
      A100: { color: '#FF8A80', text: 'black' },
      A200: { color: '#FF5252', text: 'white' },
      A400: { color: '#FF1744', text: 'white' },
      A700: { color: '#D50000', text: 'white' }
    },
    Pink: {
      '50': { color: '#FCE4EC', text: 'black' },
      '100': { color: '#F8BBD0', text: 'black' },
      '200': { color: '#F48FB1', text: 'black' },
      '300': { color: '#F06292', text: 'white' },
      '400': { color: '#EC407A', text: 'white' },
      '500': { color: '#E91E63', text: 'white' },
      '600': { color: '#D81B60', text: 'white' },
      '700': { color: '#C2185B', text: 'white' },
      '800': { color: '#AD1457', text: 'white' },
      '900': { color: '#880E4F', text: 'white' },
      A100: { color: '#FF80AB', text: 'black' },
      A200: { color: '#FF4081', text: 'white' },
      A400: { color: '#F50057', text: 'white' },
      A700: { color: '#C51162', text: 'white' }
    },
    Purple: {
      '50': { color: '#F3E5F5', text: 'black' },
      '100': { color: '#E1BEE7', text: 'black' },
      '200': { color: '#CE93D8', text: 'black' },
      '300': { color: '#BA68C8', text: 'white' },
      '400': { color: '#AB47BC', text: 'white' },
      '500': { color: '#9C27B0', text: 'white' },
      '600': { color: '#8E24AA', text: 'white' },
      '700': { color: '#7B1FA2', text: 'white' },
      '800': { color: '#6A1B9A', text: 'white' },
      '900': { color: '#4A148C', text: 'white' },
      A100: { color: '#EA80FC', text: 'black' },
      A200: { color: '#E040FB', text: 'white' },
      A400: { color: '#D500F9', text: 'white' },
      A700: { color: '#AA00FF', text: 'white' }
    },
    'Deep Purple': {
      '50': { color: '#EDE7F6', text: 'black' },
      '100': { color: '#D1C4E9', text: 'black' },
      '200': { color: '#B39DDB', text: 'black' },
      '300': { color: '#9575CD', text: 'white' },
      '400': { color: '#7E57C2', text: 'white' },
      '500': { color: '#673AB7', text: 'white' },
      '600': { color: '#5E35B1', text: 'white' },
      '700': { color: '#512DA8', text: 'white' },
      '800': { color: '#4527A0', text: 'white' },
      '900': { color: '#311B92', text: 'white' },
      A100: { color: '#B388FF', text: 'black' },
      A200: { color: '#7C4DFF', text: 'white' },
      A400: { color: '#651FFF', text: 'white' },
      A700: { color: '#6200EA', text: 'white' }
    },
    Indigo: {
      '50': { color: '#E8EAF6', text: 'black' },
      '100': { color: '#C5CAE9', text: 'black' },
      '200': { color: '#9FA8DA', text: 'black' },
      '300': { color: '#7986CB', text: 'white' },
      '400': { color: '#5C6BC0', text: 'white' },
      '500': { color: '#3F51B5', text: 'white' },
      '600': { color: '#3949AB', text: 'white' },
      '700': { color: '#303F9F', text: 'white' },
      '800': { color: '#283593', text: 'white' },
      '900': { color: '#1A237E', text: 'white' },
      A100: { color: '#8C9EFF', text: 'black' },
      A200: { color: '#536DFE', text: 'white' },
      A400: { color: '#3D5AFE', text: 'white' },
      A700: { color: '#304FFE', text: 'white' }
    },
    Blue: {
      '50': { color: '#E3F2FD', text: 'black' },
      '100': { color: '#BBDEFB', text: 'black' },
      '200': { color: '#90CAF9', text: 'black' },
      '300': { color: '#64B5F6', text: 'black' },
      '400': { color: '#42A5F5', text: 'black' },
      '500': { color: '#2196F3', text: 'white' },
      '600': { color: '#1E88E5', text: 'white' },
      '700': { color: '#1976D2', text: 'white' },
      '800': { color: '#1565C0', text: 'white' },
      '900': { color: '#0D47A1', text: 'white' },
      A100: { color: '#82B1FF', text: 'black' },
      A200: { color: '#448AFF', text: 'white' },
      A400: { color: '#2979FF', text: 'white' },
      A700: { color: '#2962FF', text: 'white' }
    },
    'Light Blue': {
      '50': { color: '#E1F5FE', text: 'black' },
      '100': { color: '#B3E5FC', text: 'black' },
      '200': { color: '#81D4FA', text: 'black' },
      '300': { color: '#4FC3F7', text: 'black' },
      '400': { color: '#29B6F6', text: 'black' },
      '500': { color: '#03A9F4', text: 'black' },
      '600': { color: '#039BE5', text: 'white' },
      '700': { color: '#0288D1', text: 'white' },
      '800': { color: '#0277BD', text: 'white' },
      '900': { color: '#01579B', text: 'white' },
      A100: { color: '#80D8FF', text: 'black' },
      A200: { color: '#40C4FF', text: 'black' },
      A400: { color: '#00B0FF', text: 'black' },
      A700: { color: '#0091EA', text: 'white' }
    },
    Cyan: {
      '50': { color: '#E0F7FA', text: 'black' },
      '100': { color: '#B2EBF2', text: 'black' },
      '200': { color: '#80DEEA', text: 'black' },
      '300': { color: '#4DD0E1', text: 'black' },
      '400': { color: '#26C6DA', text: 'black' },
      '500': { color: '#00BCD4', text: 'black' },
      '600': { color: '#00ACC1', text: 'black' },
      '700': { color: '#0097A7', text: 'white' },
      '800': { color: '#00838F', text: 'white' },
      '900': { color: '#006064', text: 'white' },
      A100: { color: '#84FFFF', text: 'black' },
      A200: { color: '#18FFFF', text: 'black' },
      A400: { color: '#00E5FF', text: 'black' },
      A700: { color: '#00B8D4', text: 'black' }
    },
    Teal: {
      '50': { color: '#E0F2F1', text: 'black' },
      '100': { color: '#B2DFDB', text: 'black' },
      '200': { color: '#80CBC4', text: 'black' },
      '300': { color: '#4DB6AC', text: 'black' },
      '400': { color: '#26A69A', text: 'black' },
      '500': { color: '#009688', text: 'white' },
      '600': { color: '#00897B', text: 'white' },
      '700': { color: '#00796B', text: 'white' },
      '800': { color: '#00695C', text: 'white' },
      '900': { color: '#004D40', text: 'white' },
      A100: { color: '#A7FFEB', text: 'black' },
      A200: { color: '#64FFDA', text: 'black' },
      A400: { color: '#1DE9B6', text: 'black' },
      A700: { color: '#00BFA5', text: 'black' }
    },
    Green: {
      '50': { color: '#E8F5E9', text: 'black' },
      '100': { color: '#C8E6C9', text: 'black' },
      '200': { color: '#A5D6A7', text: 'black' },
      '300': { color: '#81C784', text: 'black' },
      '400': { color: '#66BB6A', text: 'black' },
      '500': { color: '#4CAF50', text: 'black' },
      '600': { color: '#43A047', text: 'white' },
      '700': { color: '#388E3C', text: 'white' },
      '800': { color: '#2E7D32', text: 'white' },
      '900': { color: '#1B5E20', text: 'white' },
      A100: { color: '#B9F6CA', text: 'black' },
      A200: { color: '#69F0AE', text: 'black' },
      A400: { color: '#00E676', text: 'black' },
      A700: { color: '#00C853', text: 'black' }
    },
    'Light Green': {
      '50': { color: '#F1F8E9', text: 'black' },
      '100': { color: '#DCEDC8', text: 'black' },
      '200': { color: '#C5E1A5', text: 'black' },
      '300': { color: '#AED581', text: 'black' },
      '400': { color: '#9CCC65', text: 'black' },
      '500': { color: '#8BC34A', text: 'black' },
      '600': { color: '#7CB342', text: 'black' },
      '700': { color: '#689F38', text: 'white' },
      '800': { color: '#558B2F', text: 'white' },
      '900': { color: '#33691E', text: 'white' },
      A100: { color: '#CCFF90', text: 'black' },
      A200: { color: '#B2FF59', text: 'black' },
      A400: { color: '#76FF03', text: 'black' },
      A700: { color: '#64DD17', text: 'black' }
    },
    Lime: {
      '50': { color: '#F9FBE7', text: 'black' },
      '100': { color: '#F0F4C3', text: 'black' },
      '200': { color: '#E6EE9C', text: 'black' },
      '300': { color: '#DCE775', text: 'black' },
      '400': { color: '#D4E157', text: 'black' },
      '500': { color: '#CDDC39', text: 'black' },
      '600': { color: '#C0CA33', text: 'black' },
      '700': { color: '#AFB42B', text: 'black' },
      '800': { color: '#9E9D24', text: 'black' },
      '900': { color: '#827717', text: 'white' },
      A100: { color: '#F4FF81', text: 'black' },
      A200: { color: '#EEFF41', text: 'black' },
      A400: { color: '#C6FF00', text: 'black' },
      A700: { color: '#AEEA00', text: 'black' }
    },
    Yellow: {
      '50': { color: '#FFFDE7', text: 'black' },
      '100': { color: '#FFF9C4', text: 'black' },
      '200': { color: '#FFF59D', text: 'black' },
      '300': { color: '#FFF176', text: 'black' },
      '400': { color: '#FFEE58', text: 'black' },
      '500': { color: '#FFEB3B', text: 'black' },
      '600': { color: '#FDD835', text: 'black' },
      '700': { color: '#FBC02D', text: 'black' },
      '800': { color: '#F9A825', text: 'black' },
      '900': { color: '#F57F17', text: 'black' },
      A100: { color: '#FFFF8D', text: 'black' },
      A200: { color: '#FFFF00', text: 'black' },
      A400: { color: '#FFEA00', text: 'black' },
      A700: { color: '#FFD600', text: 'black' }
    },
    Amber: {
      '50': { color: '#FFF8E1', text: 'black' },
      '100': { color: '#FFECB3', text: 'black' },
      '200': { color: '#FFE082', text: 'black' },
      '300': { color: '#FFD54F', text: 'black' },
      '400': { color: '#FFCA28', text: 'black' },
      '500': { color: '#FFC107', text: 'black' },
      '600': { color: '#FFB300', text: 'black' },
      '700': { color: '#FFA000', text: 'black' },
      '800': { color: '#FF8F00', text: 'black' },
      '900': { color: '#FF6F00', text: 'black' },
      A100: { color: '#FFE57F', text: 'black' },
      A200: { color: '#FFD740', text: 'black' },
      A400: { color: '#FFC400', text: 'black' },
      A700: { color: '#FFAB00', text: 'black' }
    },
    Orange: {
      '50': { color: '#FFF3E0', text: 'black' },
      '100': { color: '#FFE0B2', text: 'black' },
      '200': { color: '#FFCC80', text: 'black' },
      '300': { color: '#FFB74D', text: 'black' },
      '400': { color: '#FFA726', text: 'black' },
      '500': { color: '#FF9800', text: 'black' },
      '600': { color: '#FB8C00', text: 'black' },
      '700': { color: '#F57C00', text: 'black' },
      '800': { color: '#EF6C00', text: 'white' },
      '900': { color: '#E65100', text: 'white' },
      A100: { color: '#FFD180', text: 'black' },
      A200: { color: '#FFAB40', text: 'black' },
      A400: { color: '#FF9100', text: 'black' },
      A700: { color: '#FF6D00', text: 'black' }
    },
    'Deep Orange': {
      '50': { color: '#FBE9E7', text: 'black' },
      '100': { color: '#FFCCBC', text: 'black' },
      '200': { color: '#FFAB91', text: 'black' },
      '300': { color: '#FF8A65', text: 'black' },
      '400': { color: '#FF7043', text: 'black' },
      '500': { color: '#FF5722', text: 'white' },
      '600': { color: '#F4511E', text: 'white' },
      '700': { color: '#E64A19', text: 'white' },
      '800': { color: '#D84315', text: 'white' },
      '900': { color: '#BF360C', text: 'white' },
      A100: { color: '#FF9E80', text: 'black' },
      A200: { color: '#FF6E40', text: 'black' },
      A400: { color: '#FF3D00', text: 'white' },
      A700: { color: '#DD2C00', text: 'white' }
    }
  },
  v =>
    _.map(v, ({ color, text }) => ({
      backgroundColor: color.toUpperCase(),
      color: text
    }))
);
