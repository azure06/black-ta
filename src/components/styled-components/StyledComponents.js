import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

// Example from https://material-ui.com/customization/css-in-js/

// A function you can extract and put into its own module.
// Yes, 15 lines of code, it's all you need.
function styled(Component) {
  return (style, options) => {
    function StyledComponent(props) {
      const { classes, className, ...other } = props;
      return (
        <Component color="primary" className={classNames(classes.root, className)} {...other} />
      );
    }
    StyledComponent.propTypes = {
      classes: PropTypes.object.isRequired,
      className: PropTypes.string,
    };
    const styles =
      typeof style === 'function'
        ? theme => ({ root: style(theme) })
        : { root: style };
    return withStyles(styles, options)(StyledComponent);
  };
}

// You can even write CSS with https://github.com/cssinjs/jss-template.
export const StyledButton = styled(Button)({
  // background:
  // 'linear-gradient(45deg, rgba(0, 137, 255) 30%, rgba(0, 177, 210) 90%)',
  borderRadius: 3,
  border: 0,
  color: 'white',
  padding: '0 30px',
  // boxShadow: '0 3px 5px 2px rgba(0, 135, 215, .25)',
});
