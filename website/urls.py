from django.urls import path, include
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('overview/',views.overview,name="overview"),
    path('learning/',views.learning,name="learning"),
    path('resources/',views.resources,name="resources"),
    path('opportunities/',views.opportunities,{'selected':'none'},name="opportunities"),
    path('opportunities/meetings/',views.opportunities,{'selected':'meetings'},name="opportunities/meetings"),
    path('opportunities/jobs/',views.opportunities,{'selected':'jobs'},name="opportunities/jobs"),
    path('opportunities/grants/',views.opportunities,{'selected':'grants'},name="opportunities/grants"),
    path('references/',views.references,name="references"),
    path('links/',views.links,name="links"),
    path('software/',views.page,name="software"),
    path('about/',views.page,name="about"),
    path('license/',views.license,name="license"),
    path('contact/',views.contact,name="contact"),
]
