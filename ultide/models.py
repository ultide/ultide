from flask_sqlalchemy import SQLAlchemy
from flask_user import UserMixin
import ultide.common as common

# Initialize Flask extensions
db = SQLAlchemy()                            # Initialize Flask-SQLAlchemy

# Define the User data model. Make sure to add flask.ext.user UserMixin !!!
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)

    # User authentication information
    username = db.Column(db.String(50), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False, server_default='')
    reset_password_token = db.Column(db.String(100), nullable=False, server_default='')

    # User email information
    email = db.Column(db.String(255), nullable=False, unique=True)
    confirmed_at = db.Column(db.DateTime())

    # User information
    active = db.Column('is_active', db.Boolean(), nullable=False, server_default='0')
    first_name = db.Column(db.String(100), nullable=False, server_default='')
    last_name = db.Column(db.String(100), nullable=False, server_default='')
    
    def verify_password(self, password):
        return common.user_manager.verify_password(password, self)
      
    def get_property(self, name):
        prop = UserProperties.query.filter_by(name=name).first()
        if (prop is None):
            return None
        else:
            return prop.value
    def set_property(self, name, value):
        prop = UserProperties.query.filter_by(user_id=self.id,name=name).first()
        if (prop is not None):
            prop.value = value
        else:
            prop = UserProperties(user_id=self.id, name=name, value=value)
            db.session.add(prop)
        db.session.commit()
      
      
class UserProperties(db.Model):
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=False)
    name = db.Column(db.String(255), primary_key=True, autoincrement=False, nullable=False, server_default='')
    value = db.Column(db.Text(), nullable=True)
    
    