'use client';

import React from 'react';
import Link from 'next/link';
import {IconButton, Tooltip} from '@mui/material';
import {ChevronRight} from 'lucide-react';
import {getTranslations} from '@/translations';

const t = getTranslations(true);

export default function BackToManagementButton() {
    return (
        <Tooltip title={t.backToManagement}>
            <IconButton
                component={Link}
                href="/management"
                aria-label={t.backToManagement}
                sx={{
                    color: '#2D5043',
                    // Float in the container's margin gutter (inline-start = right in RTL),
                    // 40px button + 5px gap; inline on smaller screens where there is no gutter.
                    marginInlineStart: {xs: 0, lg: '-45px'},
                    '&:hover': {
                        bgcolor: 'rgba(45, 80, 67, 0.1)',
                    },
                }}
            >
                <ChevronRight size={24}/>
            </IconButton>
        </Tooltip>
    );
}
