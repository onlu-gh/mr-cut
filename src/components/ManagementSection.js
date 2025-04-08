import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Grid,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Add } from '@mui/icons-material';
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
              title={item[columns[0].field]}
              description={item[columns[1]?.field]}
              details={getDetails(item)}
              onEdit={() => handleOpenDialog(item)}
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
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              {columns.map((column) => (
                <TableCell key={column.field} align={column.align || 'left'}>
                  {column.renderCell ? column.renderCell(item) : item[column.field]}
                </TableCell>
              ))}
              <TableCell align="right">
                <Button onClick={() => handleOpenDialog(item)}>Edit</Button>
                <Button onClick={() => onDelete(item.id)}>Delete</Button>
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
        {!isMobile && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add New
          </Button>
        )}
      </Box>

      {isMobile ? renderMobileView() : renderDesktopView()}

      {isMobile && (
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
          Add New
        </Button>
      )}

      <ManagementDialog
        open={openDialog}
        onClose={handleCloseDialog}
        title={editingItem ? `Edit ${dialogTitle}` : dialogTitle}
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