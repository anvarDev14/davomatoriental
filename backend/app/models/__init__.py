"""
Database models
"""
from app.models.user import User
from app.models.direction import Direction
from app.models.group import Group
from app.models.student import Student
from app.models.teacher import Teacher
from app.models.subject import Subject
from app.models.teacher_subject import TeacherSubject
from app.models.schedule import Schedule
from app.models.lesson import Lesson
from app.models.attendance import Attendance

__all__ = [
    "User",
    "Direction",
    "Group",
    "Student",
    "Teacher",
    "Subject",
    "TeacherSubject",
    "Schedule",
    "Lesson",
    "Attendance"
]
