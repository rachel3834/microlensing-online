from django.contrib import admin
from .models import TutorialPage, SitePage, InteractiveTool, ConceptPage
from .models import GroundSurvey, Author, OnlineResource, Reference
from .models import Movie, Picture, Meeting, Job, Grant, File

admin.site.register(TutorialPage)
admin.site.register(ConceptPage)
admin.site.register(SitePage)
admin.site.register(InteractiveTool)
admin.site.register(GroundSurvey)
admin.site.register(Author)
admin.site.register(OnlineResource)
admin.site.register(Reference)
admin.site.register(Movie)
admin.site.register(Picture)
admin.site.register(Meeting)
admin.site.register(Job)
admin.site.register(Grant)
admin.site.register(File)