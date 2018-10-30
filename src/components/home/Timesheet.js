import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

const styles = theme => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto',
  },
  table: {
    minWidth: 700,
  },
});

function Timesheet(props) {
  const { classes, excelData } = props;
  console.error(props);
  const rows = excelData.map((data, id) => [id, ...data]);

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Day</TableCell>
            <TableCell>Start time</TableCell>
            <TableCell>End time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map(row => {
            return (
              <TableRow key={row[1]}>
                <TableCell component="th" scope="row">
                  {`${row[1].getFullYear()}/${row[1].getMonth() +
                    1}/${row[1].getDate()}`}
                </TableCell>
                <TableCell>
                  {`${row[2].getHours()}:${row[2].getMinutes()}`}
                </TableCell>
                <TableCell>
                  {`${row[3].getHours()}:${row[3].getMinutes()}`}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}

Timesheet.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Timesheet);
