from __future__ import unicode_literals

from django.db import models

class TutorialPage(models.Model):
    author = models.ForeignKey('auth.User')
    title = models.CharField(max_length=200)
    text = models.TextField()
    last_modified_date = models.DateTimeField(
            blank=True, null=True)
    
    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()
        
    def __str__(self):
        return self.title