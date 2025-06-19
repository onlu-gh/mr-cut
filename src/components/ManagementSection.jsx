import {useState} from 'react';
import {
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {Add} from '@mui/icons-material';
import ManagementCard from './ManagementCard';
import ManagementDialog from './ManagementDialog';
import WorkingHoursEditor from './WorkingHoursEditor';

export default function ManagementSection({
  title,
  items,
  fields,
  onAdd,
  onEdit,
  onDelete,
  columns,
  getDetails,
  initialFormData,
  dialogTitle = 'Add New Item',
  customComponents = {}
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openDialog, setOpenDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData(initialFormData);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setFormData(initialFormData);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await onEdit(editingItem.id, formData);
      } else {
        await onAdd(formData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const renderMobileView = () => (
    <Box sx={{ pb: 8 }}>
      <Grid container spacing={2}>
        {items.map((item) => (
          <Grid item xs={12} key={item.id}>
            <ManagementCard
              title={columns[0].valueGetter ? columns[0].valueGetter({ row: item }) : item[columns[0].field]}
              details={getDetails(item)}
              onEdit={!!onEdit ? (() => handleOpenDialog(item)) : null}
              onDelete={() => onDelete(item.id)}
              workingHours={item.workingHours}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderDesktopView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.field} align={column.align || 'left'}>
                {column.headerName}
              </TableCell>
            ))}
            <TableCell align="right">פעולות</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.field} align={column.align || 'left'}>
                  {column.valueGetter ? column.valueGetter({ row: item }) : item[column.field]}
                </TableCell>
              ))}
              <TableCell align="right">
                {!!onEdit && <Button onClick={() => handleOpenDialog(item)}>ערוך</Button>}
                <Button onClick={() => onDelete(item.id)}>מחק</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {(!isMobile && !!onAdd) && (
          <Button variant="contained"
            onClick={() => handleOpenDialog()}>
            <Add />
            הוסף
          </Button>
        )}
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {(isMobile  && !!onAdd) && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          הוסף
        </Button>
      )}

      <ManagementDialog
        open={openDialog}
        onClose={handleCloseDialog}
        isEditing={editingItem}
        title={editingItem ? `ערוך ${dialogTitle}` : `הוסף ${dialogTitle}`}
        formData={formData}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        fields={fields}
        isMobile={isMobile}
        customComponents={{
          ...customComponents,
          WorkingHoursEditor: ({ value, onChange, isMobile }) => (
            <WorkingHoursEditor
              workingHours={value}
              onChange={onChange}
              isMobile={isMobile}
            />
          )
        }}
      />
    </Box>
  );
} 