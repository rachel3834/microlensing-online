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
from django.conf.urls import url
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from tutorial.views import home, page, learning, overview, resources
from tutorial.views import interactive, opportunities, article, references
from tutorial.views import links, list_resources

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$',home,name="home"),
    url(r'^tutorial/(?P<pk>[0-9]+)/$',article,{'resource_type':'tutorial'},name="tutorial"),
    url(r'^concept/(?P<pk>[0-9]+)/$',article,{'resource_type':'concept'},name="concept"),
    url(r'^interactive/(?P<pk>[0-9]+)/$',interactive,name="interactive"),
    url(r'^tutorial/$',article,{'resource_type':'tutorial'},name="tutorial"),
    url(r'^concept/$',article,{'resource_type':'concept'},name="concept"),
    url(r'^learning/$',learning,name="learning"),
    url(r'^references/$',references,name="references"),
    url(r'^links/$',links,name="links"),
    url(r'^pictures/$',list_resources,{'resource_type':'Pictures'}),
    url(r'^movies/$',list_resources,{'resource_type':'Movies'}),
    url(r'^movies/(?P<pk>[0-9]+)/$',list_resources,{'resource_type':'Movies'},name='movies'),
    url(r'^glossary/$',page,name="glossary"),
    url(r'^overview/$',overview,name="overview"),
    url(r'^ground-based-surveys/$',page,name="Ground-based Surveys"),
    url(r'^space-based-programs/$',page,name="Space-based Programs"),
    url(r'^follow-up-programs/$',page,name="Follow-up Programs"),
    url(r'^resources/$',resources,name="resources"),
    url(r'^interactive/$',interactive,name="interactive"),
    url(r'^opportunities/$',opportunities,name="opportunities"),
    url(r'^about/$',page,name="about"),
    url(r'^contact/$',page,name="contact"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
