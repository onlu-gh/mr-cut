import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography} from '@mui/material';
import {TimePicker} from '@mui/x-date-pickers';
import React from 'react';
import {format, parse} from 'date-fns';

const COMMON_CUSTOM_COMPONENTS = {
    time: ({value, onChange, label}) => (
        <TimePicker
            sx={{
                width: '100%',
            }}
            label={label}
            minutesStep={30}
            timeSteps={{minutes: 30}}
            value={value ? parse(value, 'HH:mm', new Date()) : null}
            onChange={(value) => onChange(format(value, 'HH:mm'))}
        />
    ),
    text: ({value}) => (
        <span>{value}</span>
    ),
}

export default function ManagementDialog({
                                             open,
                                             onClose,
                                             title,
                                             isEditing = false,
                                             formData,
                                             onFormChange,
                                             onDelete,
                                             deleteText,
                                             onSubmit,
                                             fields,
                                             isMobile = false,
                                             customComponents = {},
                                             extraActions = null
                                         }) {
    const handleCustomChange = (name, value) => {
        onFormChange({target: {name, value}});
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}>
            <DialogTitle>
                {title}
            </DialogTitle>
            <form onSubmit={onSubmit}>
                <DialogContent sx={{paddingBlock: 0}}>
                    <Grid container spacing={2} sx={{mt: 1}}>
                        {fields.map((field) => (
                            <Grid item xs={12} key={field.name}>
                                {field.type === 'select' ? (
                                    <TextField
                                        fullWidth
                                        select
                                        label={field.label}
                                        name={field.name}
                                        value={formData[field.name]}
                                        onChange={onFormChange}
                                        SelectProps={{
                                            native: true,
                                        }}
                                        size={isMobile ? "medium" : "small"}>
                                        {field.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </TextField>
                                ) : field.customComponent ? (
                                    (customComponents[field.customComponent] ?? COMMON_CUSTOM_COMPONENTS[field.customComponent])({
                                        value: formData[field.name],
                                        onChange: (value) => handleCustomChange(field.name, value),
                                        isMobile,
                                        label: field.label,
                                    })
                                ) : (
                                    <>
                                        {field.maxLength && (
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{display: 'block', textAlign: 'end', my: 0}}
                                            >
                                                {`${(formData[field.name] ?? '').length}/${field.maxLength}`}
                                            </Typography>
                                        )}
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            name={field.name}
                                            type={field.type || 'text'}
                                            value={formData[field.name]}
                                            onChange={onFormChange}
                                            multiline={field.multiline}
                                            rows={field.rows}
                                            minRows={field.minRows}
                                            required={field.required}
                                            inputProps={field.maxLength
                                                ? {...field.inputProps, maxLength: field.maxLength}
                                                : field.inputProps}
                                            size={isMobile ? "medium" : "small"}
                                        />
                                    </>
                                )}
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions sx={{
                    justifyContent: isEditing && onDelete ? 'space-between' : 'flex-end',
                    paddingBlock: 4,
                    boxSizing: 'border-box',
                }}>
                    {
                        (isEditing && onDelete) &&
                        <Button onClick={onDelete} variant="outlined"
                                color={'error'}
                                sx={{
                                    marginInlineStart: 2,
                                }}
                                size={isMobile ? "large" : "medium"}>
                            {deleteText ?? 'מחק'}
                        </Button>
                    }
                    <div style={{display: 'flex', gap: 20, marginInlineEnd: 20}}>
                        <Button variant={'outlined'} color={'info'} onClick={onClose}
                                size={isMobile ? "large" : "medium"}>
                            ביטול
                        </Button>
                        <Button type="submit" variant="contained" size={isMobile ? "large" : "medium"}>
                            {isEditing ? 'עדכן' : 'צור'}
                        </Button>
                        {extraActions}
                    </div>
                </DialogActions>
            </form>
        </Dialog>
    );
} 