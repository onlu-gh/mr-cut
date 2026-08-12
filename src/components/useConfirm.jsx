'use client';

import React, {useCallback, useState} from 'react';
import {
    Alert,
    Backdrop,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Snackbar,
} from '@mui/material';

// Promise-based replacement for the native `window.confirm`, with a built-in
// spinner while the confirmed action runs and a success snackbar afterwards.
// Usage:
//   const [confirm, ConfirmDialog] = useConfirm();
//   confirm({
//       message: '...',
//       successMessage: '...',
//       onConfirm: async () => { ...await the delete...; },
//   });
//   return (<> ... {ConfirmDialog} </>);
// If `onConfirm` throws, the success snackbar is skipped (let the caller surface
// its own error).
// Pass `alert: true` for an informational dialog: a single acknowledge button
// (label via `confirmLabel`, default 'הבנתי'), no cancel button and no action.
export default function useConfirm() {
    const [state, setState] = useState({
        open: false,
        message: '',
        successMessage: '',
        onConfirm: null,
        alert: false,
        confirmLabel: '',
    });
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({open: false, message: ''});

    const confirm = useCallback(({message, successMessage, onConfirm, alert = false, confirmLabel = ''}) => {
        setState({open: true, message, successMessage, onConfirm, alert, confirmLabel});
    }, []);

    const handleClose = () => {
        if (loading) {
            return;
        }
        setState((prev) => ({...prev, open: false}));
    };

    const handleConfirm = async () => {
        if (!state.onConfirm) {
            setState((prev) => ({...prev, open: false}));
            return;
        }
        setLoading(true);
        try {
            await state.onConfirm?.();
            setState((prev) => ({...prev, open: false}));
            if (state.successMessage) {
                setSnackbar({open: true, message: state.successMessage});
            }
        } catch {
            setState((prev) => ({...prev, open: false}));
        } finally {
            setLoading(false);
        }
    };

    const ConfirmDialog = (
        <>
            <Dialog open={state.open} onClose={handleClose} dir="rtl" maxWidth="xs" fullWidth>
                <DialogContent>
                    <DialogContentText sx={{color: 'text.primary'}}>
                        {state.message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{gap: 1, p: 2}}>
                    {!state.alert && (
                        <Button onClick={handleClose} variant="outlined" color="secondary" disabled={loading}>
                            לא
                        </Button>
                    )}
                    <Button onClick={handleConfirm} variant="contained" color="primary" disabled={loading}>
                        {state.alert ? (state.confirmLabel || 'הבנתי') : 'כן'}
                    </Button>
                </DialogActions>
            </Dialog>
            <Backdrop open={loading} sx={{zIndex: (theme) => theme.zIndex.modal + 1}}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Snackbar open={snackbar.open}
                      autoHideDuration={3000}
                      onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
                      anchorOrigin={{horizontal: 'center', vertical: 'top'}}>
                <Alert severity="success"
                       onClose={() => setSnackbar((prev) => ({...prev, open: false}))}
                       sx={{width: '100%'}}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );

    return [confirm, ConfirmDialog];
}
