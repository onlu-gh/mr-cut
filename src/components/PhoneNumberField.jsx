import React, {useEffect, useState} from 'react';
import {Box, MenuItem, Select, TextField} from '@mui/material';

// Carrier prefix as a dropdown, rest of the number as a text field. The stored
// value is the canonical E.164-ish form used across the app (`+972` country code
// + prefix without its leading 0 + body), e.g. `+972501234567`.
const PHONE_NUMBER_PREFIXES = {
    '050': '50',
    '051': '51',
    '052': '52',
    '053': '53',
    '054': '54',
    '055': '55',
    '056': '56',
    '057': '57',
    '058': '58',
    '059': '59',
};

const IL_COUNTRY_CODE = '+972';
const BODY_MAX_LENGTH = 7;

// digits (e.g. '50') -> prefix id (e.g. '050')
const PREFIX_ID_BY_DIGITS = Object.fromEntries(
    Object.entries(PHONE_NUMBER_PREFIXES).map(([id, digits]) => [digits, id])
);

function parsePhoneNumber(value) {
    if (!value) {
        return {prefix: '050', body: ''};
    }

    let digits = String(value).replace(/\D/g, '');

    if (digits.startsWith('972')) {
        digits = digits.slice(3);
    } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    const prefixDigits = digits.slice(0, 2);
    const prefixId = PREFIX_ID_BY_DIGITS[prefixDigits];

    if (!prefixId) {
        return {prefix: '050', body: ''};
    }

    return {prefix: prefixId, body: digits.slice(2, 2 + BODY_MAX_LENGTH)};
}

// `+972501234567` -> `0501234567` (drop country code, restore leading 0).
export function formatPhoneNumberForDisplay(value) {
    if (!value) {
        return value;
    }

    let digits = String(value).replace(/\D/g, '');

    if (digits.startsWith('972')) {
        digits = digits.slice(3);
    }

    if (!digits.startsWith('0')) {
        digits = `0${digits}`;
    }

    return digits;
}

// `+972501234567` -> `501234567` (national significant number: no country code,
// no trunk 0). Server-side OTP prepends `+972` to this.
export function toNationalPhoneNumber(value) {
    if (!value) {
        return '';
    }

    let digits = String(value).replace(/\D/g, '');

    if (digits.startsWith('972')) {
        digits = digits.slice(3);
    } else if (digits.startsWith('0')) {
        digits = digits.slice(1);
    }

    return digits;
}

function buildPhoneNumber(prefix, body) {
    if (!body) {
        return '';
    }

    return `${IL_COUNTRY_CODE}${PHONE_NUMBER_PREFIXES[prefix]}${body}`;
}

export default function PhoneNumberField({value, onChange, isMobile, label, size}) {
    const resolvedSize = size ?? (isMobile ? 'medium' : 'small');

    // Prefix/body live in local state so the chosen prefix survives an empty body
    // (the canonical value collapses to '' when there's no body, which would
    // otherwise reset the prefix back to the default).
    const [prefix, setPrefix] = useState(() => parsePhoneNumber(value).prefix);
    const [body, setBody] = useState(() => parsePhoneNumber(value).body);

    // Adopt an externally-provided value (e.g. edit dialog opening); only take its
    // prefix when it actually carries a number, so empty emissions don't reset it.
    useEffect(() => {
        const parsed = parsePhoneNumber(value);
        setBody(parsed.body);
        if (parsed.body) {
            setPrefix(parsed.prefix);
        }
    }, [value]);

    const handlePrefixChange = (e) => {
        setPrefix(e.target.value);
        onChange(buildPhoneNumber(e.target.value, body));
    };

    const handleBodyChange = (e) => {
        const nextBody = e.target.value.replace(/\D/g, '').slice(0, BODY_MAX_LENGTH);
        setBody(nextBody);
        onChange(buildPhoneNumber(prefix, nextBody));
    };

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row-reverse',
            alignItems: 'center',
            gap: 1,
        }}>
            <Select variant={'outlined'}
                    size={resolvedSize}
                    value={prefix}
                    onChange={handlePrefixChange}
                    sx={{
                        minWidth: 90,
                        backgroundColor: 'white',
                    }}>
                {Object.keys(PHONE_NUMBER_PREFIXES).map((prefixId) => (
                    <MenuItem key={prefixId} value={prefixId}>
                        {prefixId}
                    </MenuItem>
                ))}
            </Select>
            <TextField
                fullWidth
                size={resolvedSize}
                label={label}
                value={body}
                onChange={handleBodyChange}
                inputProps={{
                    inputMode: 'numeric',
                    maxLength: BODY_MAX_LENGTH,
                    dir: 'ltr',
                }}
                sx={{backgroundColor: 'white'}}
            />
        </Box>
    );
}
