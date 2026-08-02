'use client';

import {
  Box,
  Container,
  Typography,
  Divider,
  Link as MuiLink,
} from '@mui/material';
import BackToLoginLink from '@/components/BackToLoginLink';

export default function CookiePolicyPage() {
  return (
    <Box sx={{ bgcolor: '#F5F1E6', minHeight: '100vh', py: 8 }} dir="rtl">
      <BackToLoginLink />
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}
          >
            מדיניות עוגיות
          </Typography>
          <Box sx={{ width: '96px', height: '4px', bgcolor: '#B87333', mx: 'auto' }} />
        </Box>

        <Box sx={{ bgcolor: 'white', borderRadius: 2, p: { xs: 3, md: 5 }, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>

          {/* Intro */}
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            מדיניות זו מסבירה מהן עוגיות (Cookies), אילו עוגיות אנו עושים בהן שימוש באתר מר קאט, לאילו מטרות, וכיצד באפשרותך לנהל את העדפותיך. השימוש בעוגיות נעשה בהתאם למדיניות הפרטיות שלנו ולדין החל.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* What are cookies */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            מהן עוגיות?
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            עוגייה היא קובץ טקסט קטן שנשמר בדפדפן שלך בעת ביקור באתר. עוגיות מאפשרות לאתר לזכור מידע על הביקור שלך, כגון פרטי ההתחברות וההעדפות שלך, על מנת לשפר את חוויית השימוש ולאפשר את פעולתו התקינה של האתר.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Types of cookies we use */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            סוגי העוגיות שבהן אנו משתמשים
          </Typography>

          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 1 }}>
            עוגיות הכרחיות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 2, lineHeight: 1.9 }}>
            עוגיות אלה חיוניות לתפקוד האתר ואינן ניתנות לביטול. הן נשמרות גם אם בחרת לדחות עוגיות, שכן בלעדיהן חלק מהשירותים אינם יכולים לפעול:
          </Typography>
          <Box component="ul" sx={{ pr: 3, color: '#333', lineHeight: 1.9, mb: 3 }}>
            <li>
              <strong>userData</strong> — שומרת את מצב ההתחברות שלך כדי שלא תידרש להזדהות מחדש בכל עמוד.
            </li>
            <li>
              <strong>cookieConsent</strong> — שומרת את בחירתך לגבי השימוש בעוגיות (אישור או דחייה), כדי שלא נציג לך את הבקשה בכל ביקור.
            </li>
          </Box>

          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 1 }}>
            עוגיות לא-הכרחיות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            עוגיות אלה (כגון עוגיות העדפות או מדידה) נשמרות רק לאחר שנתת את הסכמתך. בעת דחיית עוגיות הן אינן נכתבות, וכל עוגייה לא-הכרחית קיימת נמחקת. נכון להיום האתר אינו עושה שימוש בעוגיות מדידה או פרסום של צד שלישי.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Managing cookies */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            ניהול העדפות העוגיות
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            בכניסה הראשונה לאתר מוצגת הודעת עוגיות המאפשרת לך לאשר או לדחות את השימוש בעוגיות לא-הכרחיות. בנוסף, באפשרותך למחוק או לחסום עוגיות בכל עת דרך הגדרות הדפדפן שלך. שים לב כי חסימת עוגיות הכרחיות עלולה לפגוע בתפקוד האתר, לרבות היכולת להישאר מחובר.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Retention */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            תוקף ושמירה
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            עוגיית ההסכמה נשמרת לתקופה של עד שנה, ועוגיית ההתחברות עד לתקופה המרבית שהדפדפן מתיר (כ-400 ימים) ומתחדשת בכל התחברות. במקרה של עדכון מהותי בעוגייה, גרסתה מתעדכנת והעוגייה הישנה נמחקת אוטומטית בעת הביקור הבא.
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Contact */}
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#2D5043', mb: 2 }}>
            יצירת קשר
          </Typography>
          <Typography variant="body1" sx={{ color: '#333', mb: 3, lineHeight: 1.9 }}>
            לשאלות בנוגע למדיניות העוגיות ניתן לפנות אלינו בדוא"ל:{' '}
            <MuiLink href="mailto:tomoyo.company@gmail.com" sx={{ color: '#2D5043', fontWeight: 600 }}>
              tomoyo.company@gmail.com
            </MuiLink>
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Date */}
          <Typography variant="body2" sx={{ color: '#888', textAlign: 'center' }}>
            מדיניות זו עודכנה לאחרונה: יולי 2026
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
