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
    TableRow, Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {Add} from '@mui/icons-material';
import ManagementCard from './ManagementCard';
import ManagementDialog from './ManagementDialog';
import WorkingHoursEditor from './WorkingHoursEditor';
import BackToManagementButton from './BackToManagementButton';

export default function ManagementSection({
                                              title,
                                              items,
                                              fields,
                                              onAdd,
                                              onEdit,
                                              preventDelete,
                                              onDelete,
                                              deleteText,
                                              cannotDeleteText,
                                              columns,
                                              getDetails,
                                              initialFormData,
                                              dialogTitle = 'Add New Item',
                                              customComponents = {},
                                              renderItemActions,
                                              headerActions,
                                              showBackButton = false
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
        const {name, value} = e.target;
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

    // Card title comes from the first column that has a mobile-friendly value:
    // a valueGetter, or a plain field without a custom cell renderer (e.g. toggles).
    const titleColumn = columns.find(column => column.valueGetter || !column.renderCell) || columns[0];

    const renderMobileView = () => (
        <Box sx={{pb: 8}}>
            <Grid container spacing={2}>
                {items.map((item) => (
                    <Grid item xs={12} key={item.id}>
                        <ManagementCard
                            title={titleColumn.valueGetter ? titleColumn.valueGetter({row: item}) : item[titleColumn.field]}
                            details={getDetails(item)}
                            onEdit={!!onEdit ? (() => handleOpenDialog(item)) : null}
                            preventDelete={preventDelete?.(item)}
                            cannotDeleteText={cannotDeleteText}
                            onDelete={() => onDelete(item.id)}
                            deleteText={deleteText}
                            workingHours={item.workingHours}
                            actions={renderItemActions?.(item, 'mobile')}
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
                            <TableCell key={column.field} align={column.align || 'left'} sx={column.sx}>
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
                                <TableCell key={column.field} align={column.align || 'left'} sx={column.sx}>
                                    {column.renderCell
                                        ? column.renderCell(item)
                                        : column.valueGetter ? column.valueGetter({row: item}) : item[column.field]}
                                </TableCell>
                            ))}
                            <TableCell align="right">
                                <Box sx={{display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'flex-end'}}>
                                    {renderItemActions?.(item, 'desktop')}
                                    {!!onEdit &&
                                        <Button color={'secondary'}
                                                onClick={() => handleOpenDialog(item)}>ערוך</Button>}
                                    <div style={{position: 'relative', width: 'fit-content'}}>
                                        <Button color={'error'} disabled={preventDelete?.(item)}
                                                onClick={() => onDelete(item.id)}>{deleteText ?? 'מחק'}</Button>
                                        <Tooltip title={cannotDeleteText} hidden={!preventDelete?.(item)}>
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                height: '100%'
                                            }}/>
                                        </Tooltip>
                                    </div>
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    return (
        <Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 3}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    {showBackButton && <BackToManagementButton/>}
                    <Typography variant="h4" component="h1">
                        {title}
                    </Typography>
                </Box>
                <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
                    {headerActions}
                    {(!isMobile && !!onAdd) && (
                        <Button variant="contained"
                                color={'primary'}
                                onClick={() => handleOpenDialog()}>
                            <Add/>
                            הוסף
                        </Button>
                    )}
                </Box>
            </Box>

            {isMobile ? renderMobileView() : renderDesktopView()}

            {(isMobile && !!onAdd) && (
                <Button
                    color={'primary'}
                    variant="contained"
                    startIcon={<Add/>}
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
                deleteText={deleteText}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                fields={fields}
                isMobile={isMobile}
                customComponents={{
                    ...customComponents,
                    WorkingHoursEditor: ({value, onChange, isMobile}) => (
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