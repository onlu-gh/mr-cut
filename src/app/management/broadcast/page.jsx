'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Switch,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Edit, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { BroadcastMessage } from '@/entities/BroadcastMessage';
import ManagementSection from '@/components/ManagementSection';
import BackToManagementButton from '@/components/BackToManagementButton';
import ManagementDialog from '@/components/ManagementDialog';
import { getTranslations } from '@/translations';

const t = getTranslations(true);

const initialFormData = {
  content: '',
};

export default function BroadcastManagementPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addFormData, setAddFormData] = useState(initialFormData);
  const [editingOrder, setEditingOrder] = useState(false);
  // Frontend-only working copy of the active messages while reordering.
  const [orderedActive, setOrderedActive] = useState([]);
  const [, setError] = useState(null);

  useEffect(() => {
    const userData = Cookies.get('userData');
    if (!userData) {
      router.push('/');
      return;
    }

    const { role } = JSON.parse(userData);
    if (role !== 'ADMIN') {
      router.push('/home');
      return;
    }

    loadMessages();
  }, [router]);

  const loadMessages = async () => {
    try {
      const list = await BroadcastMessage.getAll();
      setMessages(list);
    } catch (error) {
      setError('Failed to load broadcast messages');
    }
  };

  const handleOpenAddDialog = () => {
    setAddFormData(initialFormData);
    setAddDialogOpen(true);
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const message = new BroadcastMessage({
        ...addFormData,
        active: e.nativeEvent.submitter?.name === 'createActive',
      });
      await message.save();
      setAddDialogOpen(false);
      setAddFormData(initialFormData);
      await loadMessages();
    } catch (error) {
      setError('Failed to save broadcast message');
    }
  };

  const handleEdit = async (id, formData) => {
    try {
      const message = new BroadcastMessage({ ...formData, id });
      await message.save();
      await loadMessages();
    } catch (error) {
      setError('Failed to update broadcast message');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם למחוק את ההודעה?')) {
      try {
        const message = new BroadcastMessage({ id });
        await message.delete();
        await loadMessages();
      } catch (error) {
        setError('Failed to delete broadcast message');
      }
    }
  };

  const handleToggleActive = async (item) => {
    setUpdatingStatus(true);
    try {
      const message = new BroadcastMessage({ ...item, active: !item.active });
      await message.save();
      await loadMessages();
    } catch (error) {
      setError('Failed to update broadcast message');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // No extra details on mobile cards — status is conveyed by the toggle and section.
  const getMessageDetails = () => [];

  const activeMessages = messages.filter((message) => message.active);
  const inactiveMessages = messages.filter((message) => !message.active);

  const handleStartEditOrder = () => {
    setOrderedActive(activeMessages);
    setEditingOrder(true);
  };

  const handleCancelEditOrder = () => {
    setEditingOrder(false);
    setOrderedActive([]);
  };

  const handleMoveActive = (index, direction) => {
    setOrderedActive((prev) => {
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const handleSaveOrder = async () => {
    setUpdatingStatus(true);
    try {
      await BroadcastMessage.reorder(orderedActive.map((message) => message.id));
      await loadMessages();
      setEditingOrder(false);
      setOrderedActive([]);
    } catch (error) {
      setError('Failed to reorder broadcast messages');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const messageFields = [
    {
      name: 'content',
      label: 'תוכן ההודעה',
      required: true,
      multiline: true,
      minRows: 8,
      maxLength: 350,
    },
  ];

  const renderStatusToggle = (item) => (
    <Switch
      color="success"
      checked={item.active}
      // Toggling would change the active set mid-reorder and invalidate the save.
      disabled={editingOrder}
      onChange={() => handleToggleActive(item)}
      inputProps={{ 'aria-label': item.active ? 'השבת' : 'הפעל' }}
    />
  );

  const renderOrderControls = (item, large = false) => {
    const index = orderedActive.findIndex((message) => message.id === item.id);
    const iconSx = { fontSize: large ? 32 : 24 };
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton
          size={large ? 'medium' : 'small'}
          disabled={index <= 0}
          onClick={() => handleMoveActive(index, -1)}
          aria-label="העבר למעלה"
        >
          <KeyboardArrowUp sx={iconSx} />
        </IconButton>
        <IconButton
          size={large ? 'medium' : 'small'}
          disabled={index < 0 || index >= orderedActive.length - 1}
          onClick={() => handleMoveActive(index, 1)}
          aria-label="העבר למטה"
        >
          <KeyboardArrowDown sx={iconSx} />
        </IconButton>
      </Box>
    );
  };

  const statusColumn = {
    field: 'active',
    headerName: 'סטטוס',
    align: 'right',
    renderCell: renderStatusToggle,
  };

  const orderColumn = {
    field: 'order',
    headerName: 'סדר',
    align: 'right',
    renderCell: renderOrderControls,
  };

  const contentColumn =
    {
      field: 'content',
      headerName: 'תוכן',
      align: 'right',
      // width 100% + maxWidth 0 makes the cell absorb all free space while
      // still letting the text truncate instead of stretching the table.
      sx: { width: '100%', maxWidth: 0 },
      renderCell: (item) => (
        <Tooltip title={item.content}>
          <Typography variant="body2" noWrap>
            {item.content}
          </Typography>
        </Tooltip>
      ),
      // Mobile card title: clamp to two lines.
      valueGetter: ({ row }) => (
        <Typography
          component="span"
          variant="inherit"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}
        >
          {row.content}
        </Typography>
      ),
    };

  const createdAtColumn = {
    field: 'created_at',
    headerName: 'תאריך יצירה',
    align: 'right',
    sx: { whiteSpace: 'nowrap' },
    valueGetter: ({ row }) =>
      row.created_at ? new Date(row.created_at).toLocaleDateString('he-IL') : '',
  };

  const activeColumns = [editingOrder ? orderColumn : statusColumn, contentColumn, createdAtColumn];
  const inactiveColumns = [statusColumn, contentColumn, createdAtColumn];

  // Desktop shows the toggle/order controls in the first column; mobile cards get them in actions.
  const renderActiveItemActions = (item, view) =>
    view === 'desktop' ? null : editingOrder ? renderOrderControls(item, true) : renderStatusToggle(item);

  const renderInactiveItemActions = (item, view) =>
    view === 'desktop' ? null : renderStatusToggle(item);

  const orderHeaderActions = editingOrder ? (
    <>
      <Button variant="contained" color="success" onClick={handleSaveOrder}>
        שמור
      </Button>
      <Button variant="outlined" color="inherit" onClick={handleCancelEditOrder}>
        ביטול
      </Button>
    </>
  ) : (
    <Button
      variant="outlined"
      startIcon={<Edit />}
      onClick={handleStartEditOrder}
      disabled={activeMessages.length < 2}
      // Theme direction is LTR while the layout is RTL, so flip the icon margins manually.
      sx={{ '& .MuiButton-startIcon': { ml: 1, mr: -0.5 } }}
    >
      ערוך סדר
    </Button>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Backdrop
        open={updatingStatus}
        sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <BackToManagementButton />
          <Typography variant="h4" component="h1">
            {t.broadcastMessages}
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
          <Add />
          הוסף
        </Button>
      </Box>
      <ManagementSection
        title="הודעות פעילות"
        items={editingOrder ? orderedActive : activeMessages}
        fields={messageFields}
        onEdit={editingOrder ? null : handleEdit}
        onDelete={handleDelete}
        canDelete={() => !editingOrder}
        columns={activeColumns}
        getDetails={getMessageDetails}
        initialFormData={initialFormData}
        dialogTitle="הודעת תפוצה"
        renderItemActions={renderActiveItemActions}
        headerActions={orderHeaderActions}
      />
      <ManagementSection
        title="הודעות לא פעילות"
        items={inactiveMessages}
        fields={messageFields}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canDelete={() => true}
        columns={inactiveColumns}
        getDetails={getMessageDetails}
        initialFormData={initialFormData}
        dialogTitle="הודעת תפוצה"
        renderItemActions={renderInactiveItemActions}
      />
      <ManagementDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        title="הוסף הודעת תפוצה"
        formData={addFormData}
        onFormChange={handleAddFormChange}
        onSubmit={handleAddSubmit}
        fields={messageFields}
        isMobile={isMobile}
        extraActions={
          <Button
            type="submit"
            name="createActive"
            variant="contained"
            color="success"
            size={isMobile ? 'large' : 'medium'}
          >
            צור והפעל
          </Button>
        }
      />
    </Box>
  );
}
