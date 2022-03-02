"""outreach URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.urls import path, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from tutorial.views import home, page, learning, overview, resources
from tutorial.views import interactive, opportunities, article, references
from tutorial.views import links, list_resources

urlpatterns = [
    re_path(r'^admin/', admin.site.urls),
    re_path(r'^$',home,name="home"),
    re_path(r'^tutorial/(?P<pk>[0-9]+)/$',article,{'resource_type':'tutorial'},name="tutorial"),
    re_path(r'^concept/(?P<pk>[0-9]+)/$',article,{'resource_type':'concept'},name="concept"),
    re_path(r'^interactive/(?P<pk>[0-9]+)/$',interactive,name="interactive"),
    re_path(r'^tutorial/$',article,{'resource_type':'tutorial'},name="tutorial"),
    re_path(r'^tutorial/(?P<short_title>[a-zA-Z]+)/$',article,{'resource_type':'tutorial'},name="tutorial_article"),
    re_path(r'^tutorial/(?P<short_title>[a-zA-Z]+-[a-zA-Z]+)/$',article,{'resource_type':'tutorial'},name="tutorial_article"),
    re_path(r'^concept/$',article,{'resource_type':'concept'},name="concept"),
    re_path(r'^concept/(?P<short_title>[a-zA-Z]+)/$',article,{'resource_type':'concept'},name="concept_article"),
    re_path(r'^concept/(?P<short_title>[a-zA-Z0-9]+-[a-zA-Z0-9]+)/$',article,{'resource_type':'concept'},name="concept_article"),
    re_path(r'^learning/$',learning,name="learning"),
    re_path(r'^references/$',references,name="references"),
    re_path(r'^links/$',links,name="links"),
    re_path(r'^software/$',page,name="software"),
    re_path(r'^public-data/$',page,name="public-data"),
    re_path(r'^pictures/$',list_resources,{'resource_type':'pictures'},name='pictures'),
    re_path(r'^pictures/(?P<pk>[0-9]+)/$',list_resources,{'resource_type':'pictures'},name='pictures'),
    re_path(r'^pictures/key/$',list_resources,{'resource_type':'pictures'},name='pictures_key'),
    re_path(r'^pictures/key/(?P<key>[a-zA-Z]+)/$',list_resources,{'resource_type':'pictures'},name='pictures_key'),
    re_path(r'^pictures/key/(?P<key>[a-zA-Z]+\+[a-z]+)/$',list_resources,{'resource_type':'pictures'},name='pictures_key'),
    re_path(r'^movies/$',list_resources,{'resource_type':'movies'},name='movies'),
    re_path(r'^movies/(?P<pk>[0-9]+)/$',list_resources,{'resource_type':'movies'},name='movies'),
    re_path(r'^movies/key/(?P<key>[a-zA-Z]+)/$',list_resources,{'resource_type':'movies'},name='movies_key'),
    re_path(r'^movies/key/(?P<key>[a-zA-Z]+\+[a-z]+)/$',list_resources,{'resource_type':'movies'},name='movies_key'),
    re_path(r'^glossary/$',page,name="glossary"),
    re_path(r'^overview/$',overview,name="overview"),
    re_path(r'^ground-based-surveys/$',page,name="Ground-based Surveys"),
    re_path(r'^space-based-programs/$',page,name="Space-based Programs"),
    re_path(r'^follow-up-programs/$',page,name="Follow-up Programs"),
    re_path(r'^resources/$',resources,name="resources"),
    re_path(r'^interactive/$',interactive,name="interactive"),
    re_path(r'^opportunities/$',opportunities,{'selected':'none'},name="opportunities"),
    re_path(r'^opportunities/meetings/$',opportunities,{'selected':'meetings'},name="opportunities/meetings"),
    re_path(r'^opportunities/jobs/$',opportunities,{'selected':'jobs'},name="opportunities/jobs"),
    re_path(r'^opportunities/grants/$',opportunities,{'selected':'grants'},name="opportunities/grants"),
    re_path(r'^about/$',page,name="about"),
    re_path(r'^license/$',page,name="license"),
    re_path(r'^contact/$',page,name="contact"),
    re_path(r'^data-challenge/$',page,name="data-challenge"),
    re_path(r'^data-challenge-guidelines/$',page,name="data-challenge-guidelines"),
    re_path(r'^data-challenge-entry-contents/$',page,name="data-challenge-entry-contents"),
    re_path(r'^table1-example-ascii/$',page,name="table1-example-ascii"),
    re_path(r'^table1-example-json/$',page,name="table1-example-json"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
