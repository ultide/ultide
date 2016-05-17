import os

# Flask settings
SECRET_KEY =              os.getenv('SECRET_KEY',       'THIS IS AN INSECURE SECRET')
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL',     'sqlite:///data/db.sqlite')
CSRF_ENABLED = True

# Flask-Mail settings
MAIL_USERNAME =           os.getenv('MAIL_USERNAME',        'email@example.com')
MAIL_PASSWORD =           os.getenv('MAIL_PASSWORD',        'password')
MAIL_DEFAULT_SENDER =     os.getenv('MAIL_DEFAULT_SENDER',  '"MyApp" <noreply@example.com>')
MAIL_SERVER =             os.getenv('MAIL_SERVER',          'smtp.gmail.com')
MAIL_PORT =           int(os.getenv('MAIL_PORT',            '465'))
MAIL_USE_SSL =        int(os.getenv('MAIL_USE_SSL',         True))

# Flask-User settings
USER_APP_NAME        = "AppName"                # Used by email templates