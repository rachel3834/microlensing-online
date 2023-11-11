from django.contrib import admin
from .models import Author, Reference, TextBlock, TutorialPage, ConceptPage
from .models import SitePage, InteractiveTool, GroundSurvey, OnlineResource
from .models import Movie, Picture, File, Meeting, Job, Grant

# Register your models here.
admin.site.register(Author)
admin.site.register(Reference)
admin.site.register(TextBlock)
admin.site.register(TutorialPage)
admin.site.register(ConceptPage)
admin.site.register(SitePage)
admin.site.register(InteractiveTool)
admin.site.register(GroundSurvey)
admin.site.register(OnlineResource)
admin.site.register(Movie)
admin.site.register(Picture)
admin.site.register(File)
admin.site.register(Meeting)
admin.site.register(Job)
admin.site.register(Grant)
