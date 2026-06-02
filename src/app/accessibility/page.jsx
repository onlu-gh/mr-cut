'use client';

import {
  Box,
  Container,
  Typography,
  Divider,
  Link as MuiLink,
} from '@mui/material';

export default function AccessibilityPage() {
  return (
    <Box sx={{ bgcolor: '#F5F1E6', minHeight: '100vh', py: 8 }} dir="rtl">
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}
          >
            הצהרת נגישות
          </Typography>
          <Box sx={{ width: '96px', height: '4px', bgcolor: '#B87333', mx: 'auto' }} />
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: 2, p: { xs: 3, md: 5 }, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

          {/* Intro */}
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            מר קאט מאמינה שלכל אדם מגיעה גישה שווה למידע ולשירותים דיגיטליים, ומחויבת להנגיש את האתר לאנשים עם מוגבלויות בהתאם לחוק שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998, ולתקנות הנגישות לשירות (התאמות נגישות לאתר אינטרנט), התשע"ד-2014.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Standard */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            רמת הנגישות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            האתר שואף לעמוד ברמת התאמה AA של תקן WCAG 2.1 (Web Content Accessibility Guidelines) ובדרישות תקן ישראלי 5568.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* UserWay */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            כלי נגישות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            האתר מצויד בתוסף נגישות של{' '}
            <MuiLink
              href="https://userway.org"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2D5043', fontWeight: 600 }}
            >
              UserWay
            </MuiLink>
            , המאפשר למשתמשים להתאים את חוויית הגלישה לצרכיהם האישיים. הכפתור נמצא בפינת המסך ומאפשר בין היתר:
          </Typography>
          <Box component="ul" sx={{ pr: 3, color: '#333', lineHeight: 1.9, mb: 3 }}>
            <li>הגדלת גופן</li>
            <li>ניגודיות גבוהה</li>
            <li>ניווט מקלדת</li>
            <li>עצירת אנימציות</li>
            <li>הדגשת קישורים</li>
            <li>קורא מסך מובנה</li>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Scope */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            היקף ההנגשה
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            ההנגשה חלה על כלל דפי האתר, לרבות: דף הבית, דף הזמנת תור, לוח הניהול ודפי הספרים.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Known limitations */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            מגבלות ידועות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            אנו פועלים לשיפור מתמיד של הנגישות. ייתכן כי חלק מהתכנים או הפונקציונליות אינם נגישים במלואם. אם נתקלתם בבעיית נגישות, נודה לכם על פנייה.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Contact */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            יצירת קשר בנושא נגישות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 1, lineHeight: 1.9 }}>
            גורם אחראי על נגישות: <strong>מר קאט</strong>
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            דוא"ל:{' '}
            <MuiLink href="mailto:[EMAIL]" sx={{ color: '#2D5043', fontWeight: 600 }}>
              [EMAIL]
            </MuiLink>
          </Typography>
          <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.9 }}>
            נשתדל להשיב לפניות נגישות בתוך 5 ימי עסקים.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Date */}
          <Typography variant="body2" sx={{ color: '#888', textAlign: 'center' }}>
            הצהרה זו עודכנה לאחרונה: מאי 2025
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
