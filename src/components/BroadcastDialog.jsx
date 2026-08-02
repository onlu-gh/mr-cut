'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MobileStepper,
  Typography,
} from '@mui/material';
import { Close, KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { BroadcastMessage } from '@/entities/BroadcastMessage';
import { getTranslations } from '@/translations';

const t = getTranslations(true);

// Shown once per browser session so returning within a session isn't nagged.
const SESSION_KEY = 'broadcastDialogSeen';
// Min horizontal travel (px) to count as a swipe.
const SWIPE_THRESHOLD = 50;

export default function BroadcastDialog() {
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;

    let cancelled = false;
    (async () => {
      try {
        const list = await BroadcastMessage.getAll();
        // Active only, ordered by the admin-defined `order` (ascending).
        const active = list
          .filter((message) => message.active)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        if (cancelled || active.length === 0) return;
        setMessages(active);
        setOpen(true);
      } catch {
        // Silent: a broadcast fetch failure shouldn't block the landing page.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(SESSION_KEY, '1');
    setOpen(false);
  };

  const maxSteps = messages.length;
  // Wrap-around in both directions.
  const handleNext = () => setStep((prev) => (prev + 1) % maxSteps);
  const handleBack = () => setStep((prev) => (prev - 1 + maxSteps) % maxSteps);

  const handleTouchStart = (e) => setTouchStartX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
      // RTL: swipe right => next, swipe left => previous.
      if (deltaX > 0) handleNext();
      else handleBack();
    }
    setTouchStartX(null);
  };

  if (maxSteps === 0) return null;

  const multiple = maxSteps > 1;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ px: 6, textAlign: 'center' }}>
        {t.announcements}
        <IconButton
          onClick={handleClose}
          aria-label="סגור"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}
        >
          {multiple && (
            // RTL: "next" sits on the left edge, "previous" on the right edge.
            <IconButton
              onClick={handleNext}
              aria-label="הבא"
              sx={{ position: 'absolute', left: 0, zIndex: 1 }}
            >
              <KeyboardArrowLeft />
            </IconButton>
          )}
          <Box
            sx={{
              flex: 1,
              // Fixed height sized for the longest allowed message (350 chars,
              // per the management maxLength). Constant regardless of content.
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflowY: 'auto',
              px: 7,
              py: 3,
            }}
          >
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', textAlign: 'center', wordBreak: 'break-word' }}
            >
              {messages[step].content}
            </Typography>
          </Box>
          {multiple && (
            <IconButton
              onClick={handleBack}
              aria-label="הקודם"
              sx={{ position: 'absolute', right: 0, zIndex: 1 }}
            >
              <KeyboardArrowRight />
            </IconButton>
          )}
        </Box>
        {multiple && (
          <MobileStepper
            variant="dots"
            steps={maxSteps}
            position="static"
            activeStep={step}
            backButton={null}
            nextButton={null}
            sx={{ justifyContent: 'center', bgcolor: 'transparent' }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
