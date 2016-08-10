from __future__ import unicode_literals

from django.db import models

class TutorialPage(models.Model):
    author = models.ForeignKey('auth.User')
    title = models.CharField(max_length=200)
    short_title = models.CharField(max_length=20,null=True)
    course_index = models.IntegerField(null=True)
    text = models.TextField()
    last_modified_date = models.DateTimeField(
            blank=True, null=True)
    
    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()
        
    def __str__(self):
        return self.title

class SitePage(models.Model):
    name = models.CharField(max_length=20)
    text = models.TextField()
    last_modified_date = models.DateTimeField(
            blank=True, null=True)
    
    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()
        
    def __str__(self):
        return self.name