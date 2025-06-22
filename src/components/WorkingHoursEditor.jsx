import {Box, Checkbox, FormControlLabel, Grid, Typography} from '@mui/material';
import {format, parse} from 'date-fns';
import {TimePicker} from '@mui/x-date-pickers';
import {useCallback} from 'react';

export default function WorkingHoursEditor({
                                               workingHours,
                                               onChange,
                                               isMobile = false
                                           }) {
    if (!workingHours)
        return null;

    const days = [
        {key: 'sunday', label: 'ראשון'},
        {key: 'monday', label: 'שני'},
        {key: 'tuesday', label: 'שלישי'},
        {key: 'wednesday', label: 'רביעי'},
        {key: 'thursday', label: 'חמישי'},
        {key: 'friday', label: 'שישי'}
    ];

    const handleTimeChange = useCallback((day, field, value) => {
        const newWorkingHours = {
            ...workingHours,
            [day]: {
                ...workingHours[day],
                [field]: value
            }
        };
        onChange(newWorkingHours);
    }, [workingHours]);

    const handleWorkingDayChange = (day, isWorking) => {
        const newWorkingHours = {
            ...workingHours,
            [day]: {
                ...workingHours[day],
                isWorking,
                start: isWorking ? workingHours[day]?.start || '09:00' : null,
                end: isWorking ? workingHours[day]?.end || '17:00' : null
            }
        };
        onChange(newWorkingHours);
    };

    return (
        <Box sx={{mt: 2}}>
            <Typography variant="h6" gutterBottom>
                שעות עבודה
            </Typography>
            <Grid container spacing={2}>
                {days.map((day) => (
                    <Grid item xs={12} key={day.key}>
                        <Box sx={{mb: 2}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        color={'secondary'}
                                        checked={workingHours[day.key]?.isWorking !== false}
                                        onChange={(e) => handleWorkingDayChange(day.key, e.target.checked)}
                                    />
                                }
                                label={
                                    <Typography variant="subtitle1">
                                        {day.label}
                                    </Typography>
                                }
                            />
                            {workingHours[day.key]?.isWorking !== false && (
                                <Grid container spacing={2} sx={{mt: 1}}>
                                    <Grid item xs={6}>
                                        <TimePicker
                                            label="התחלה"
                                            minutesStep={30}
                                            timeSteps={{minutes: 30}}
                                            value={parse(workingHours[day.key]?.start || '09:00', 'HH:mm', new Date())}
                                            onChange={(value) => handleTimeChange(day.key, 'start', format(value, 'HH:mm'))}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TimePicker
                                            label="סיום"
                                            minutesStep={30}
                                            timeSteps={{minutes: 30}}
                                            value={parse(workingHours[day.key]?.start || '09:00', 'HH:mm', new Date())}
                                            onChange={(value) => handleTimeChange(day.key, 'start', format(value, 'HH:mm'))}
                                        />
                                    </Grid>
                                </Grid>
                            )}
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
} 