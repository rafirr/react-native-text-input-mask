import React, { Component, forwardRef } from 'react'

import {
  TextInput,
  findNodeHandle,
  NativeModules,
  Platform
} from 'react-native'

const mask = NativeModules.RNTextInputMask.mask
const unmask = NativeModules.RNTextInputMask.unmask
const setMask = NativeModules.RNTextInputMask.setMask

class TextInputMask extends Component {
  static defaultProps = {
    maskDefaultValue: true,
  }

  masked = false

  componentDidMount() {
    if (this.props.maskDefaultValue &&
        this.props.mask &&
        this.props.value) {
      mask(this.props.mask, '' + this.props.value, text =>
        this.input && this.input.setNativeProps({ text }),
      )
    }

    if (this.props.mask && !this.masked) {
      this.masked = true
      setMask(findNodeHandle(this.input), this.props.mask)
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.mask && (prevProps.value !== this.props.value)) {
      mask(prevProps.mask, '' + this.props.value, text =>
      this.input && this.input.setNativeProps({ text })
      );
    }

    if (prevProps.mask !== this.props.mask) {
      setMask(findNodeHandle(this.input), this.props.mask)
    }
  }

  render() {
    return (<TextInput
      {...this.props}
      value={undefined}
      ref={ref => {
        this.input = ref
        if (typeof this.props.refInput === 'function') {
          this.props.refInput(ref)
        }
      }}
      multiline={this.props.mask && Platform.OS === 'ios' ? false : this.props.multiline}
      onChangeText={masked => {
        if (this.props.mask) {
          const _unmasked = unmask(this.props.mask, masked, unmasked => {
            this.props.onChangeText && this.props.onChangeText(masked, unmasked)
          })
        } else {
          this.props.onChangeText && this.props.onChangeText(masked)
        }
      }}
    />);
  }
}

const ForwardedTextInputMask = ({ mask, ...props }, ref) => (
  <TextInputMask
    // Force remount an component, to fix problem with
    // https://github.com/react-native-community/react-native-text-input-mask/issues/150
    key={mask}
    {...props}
    mask={mask}
    refInput={textInputInstance => {
      if (ref) {
        if (typeof ref === "function") {
          ref(textInputInstance);
        } else if (typeof ref === "object" && ref != null) {
          ref.current = textInputInstance;
        }
      }
    }}
  />
);

export { mask, unmask, setMask };

export default forwardRef(ForwardedTextInputMask);
