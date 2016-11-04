from django.contrib import admin
from .models import TutorialPage, SitePage, InteractiveTool, ConceptPage
from .models import GroundSurvey, Author

admin.site.register(TutorialPage)
admin.site.register(ConceptPage)
admin.site.register(SitePage)
admin.site.register(InteractiveTool)
admin.site.register(GroundSurvey)
admin.site.register(Author)
