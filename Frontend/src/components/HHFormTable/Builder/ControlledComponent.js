import { isFunction } from 'lodash';
import React from 'react';
import useClickOutSide from '../Hooks/useClickOutside';
import { useToggle } from '../Hooks/useToggle';

const ControlledComponent = ({
  children,
  component,
  controlledProps,
  ...props
}) => {
  const [isControlled, { toggle, setTrue, setFalse }] = useToggle(false);
  const { nodeRef } = useClickOutSide(() => setFalse());

  const getHintValue = () => controlledProps?.value || '';

  return (
    <div {...props} ref={nodeRef} onClick={setTrue}>
      {isControlled ? (
        React.isValidElement(component) ? (
          React.cloneElement(component, {
            ...controlledProps,
          })
        ) : isFunction(component) ? (
          component({ isControlled, toggle, ...controlledProps })
        ) : null
      ) : (
        <span>
          {getHintValue()}
          {isControlled.toString()}
        </span>
      )}
    </div>
  );
};

export default ControlledComponent;
