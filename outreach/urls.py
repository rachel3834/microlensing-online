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
from django.contrib import admin
from tutorial.views import home, page, tutorial, learning, overview, resources
from tutorial.views import interactive

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$',home,name="home"),
    url(r'^tutorial/(?P<pk>[0-9]+)/$',tutorial,name="tutorial"),
    url(r'^interactive/(?P<pk>[0-9]+)/$',interactive,name="interactive"),
    url(r'^tutorial/$',tutorial,name="tutorial"),
    url(r'^learning/$',learning,name="learning"),
    url(r'^overview/$',overview,name="overview"),
    url(r'^resources/$',resources,name="resources"),
    url(r'^interactive/$',interactive,name="interactive"),
    url(r'^about/$',page,name="about"),
    url(r'^contact/$',page,name="contact"),
]
