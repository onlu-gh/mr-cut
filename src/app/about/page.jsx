'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#2D5043', 
          fontWeight: 'bold', 
          mb: 4, 
          textAlign: 'center' 
        }}
      >
        המיקום שלנו
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: 400, width: 312, mx: 'auto' }}>
            <CardHeader 
              title="כתובת וטלפון"
              sx={{ bgcolor: '#F5F1E6', textAlign: 'center' }}
            />
            <CardContent sx={{ height: 'calc(100% - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <List sx={{ width: '100%' }}>
                <ListItem sx={{ justifyContent: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                    <LocationOnIcon sx={{ color: '#2D5043' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="קנאי הגליל 9"
                    secondary="ירושלים"
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
                <Divider />
                <ListItem sx={{ justifyContent: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                    <PhoneIcon sx={{ color: '#2D5043' }} />
                  </ListItemIcon>
                  <ListItemText primary="053-7152798" sx={{ textAlign: 'center' }} />
                </ListItem>
                <Divider />
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: 400, width: 312, mx: 'auto' }}>
            <CardHeader 
              title="חניה"
              sx={{ bgcolor: '#F5F1E6', textAlign: 'center' }}
            />
            <CardContent sx={{ height: 'calc(100% - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <List sx={{ width: '100%' }}>
                <ListItem sx={{ justifyContent: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                    <DirectionsCarIcon sx={{ color: '#2D5043' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="חניה חינם"
                    secondary="חניה חינם ברחוב"
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: 400, width: 312, mx: 'auto' }}>
            <CardHeader 
              title="שעות פעילות"
              sx={{ bgcolor: '#F5F1E6', textAlign: 'center' }}
            />
            <CardContent sx={{ height: 'calc(100% - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <List sx={{ width: '100%' }}>
                <ListItem sx={{ justifyContent: 'center' }}>
                  <ListItemIcon sx={{ minWidth: 0, mr: 2 }}>
                    <AccessTimeIcon sx={{ color: '#2D5043' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ראשון עד שישי"
                    secondary="09:00 - 20:00"
                    sx={{ textAlign: 'center' }}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
} 