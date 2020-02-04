from __future__ import unicode_literals

from django.db import models

class Author(models.Model):
    name = models.CharField(max_length=50)
    affiliation = models.CharField(max_length=100,null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class Reference(models.Model):
    authors = models.CharField(max_length=50)
    year = models.IntegerField()
    journal = models.CharField(max_length=50, null=True)
    volume = models.CharField(max_length=10, null=True)
    page = models.CharField(max_length=10, null=True)
    url = models.URLField(max_length=200, null=True)
    search_key = models.CharField(max_length=200)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def set_params(self,params):
        for key, value in params.items():
            setattr(self,key,value)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        ref_string = ''
        if self.url != None:
            ref_string = '<a href="'+str(self.url)+'">'+str(self.authors)+\
                        ' ('+str(self.year)+')'
            for f in [ 'journal', 'volume', 'page' ]:
                val = getattr(self,f)
                if val != None:
                    ref_string+=', '+str(val)
            ref_string+='</a>'
        else:
            ref_string = str(self.authors)+' ('+str(self.year)+')'
            for f in [ 'journal', 'volume', 'page' ]:
                val = getattr(self,f)
                if val != None:
                    ref_string+=', '+str(val)
        return ref_string

class TextBlock(models.Model):
    text = models.TextField()
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.text

class TutorialPage(models.Model):
    author = models.ForeignKey(Author,on_delete=models.SET_NULL,null=True)
    title = models.CharField(max_length=200)
    short_title = models.CharField(max_length=20,null=True)
    course_index = models.IntegerField(null=True)
    text = models.TextField()
    references = models.ManyToManyField(Reference)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title

class ConceptPage(models.Model):
    author = models.ForeignKey(Author,on_delete=models.SET_NULL,null=True)
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


class InteractiveTool(models.Model):
    author = models.ForeignKey(Author,on_delete=models.SET_NULL,null=True)
    name = models.CharField(max_length=20)
    title = models.CharField(max_length=200)
    text = models.TextField()
    tools_index = models.IntegerField(null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class GroundSurvey(models.Model):
    name = models.CharField(max_length=20)
    pi = models.CharField(max_length=40)
    tel_diameter = models.DecimalField(decimal_places=1, max_digits=5)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class OnlineResource(models.Model):
    name = models.CharField(max_length=100)
    url = models.URLField(max_length=200)
    group = models.CharField(max_length=100)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.url

class Movie(models.Model):
    name = models.CharField(max_length=200,null=True)
    filename = models.CharField(max_length=100,null=True)
    caption = models.CharField(max_length=500,null=True)
    credit = models.CharField(max_length=50,null=True)
    url = models.URLField(max_length=200,null=True)
    thumbnail = models.CharField(max_length=100,null=True)
    keywords = models.CharField(max_length=200,null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class Picture(models.Model):
    name = models.CharField(max_length=200,null=True)
    filename = models.CharField(max_length=100,null=True)
    caption = models.CharField(max_length=500,null=True)
    credit = models.CharField(max_length=50,null=True)
    url = models.URLField(max_length=200,null=True)
    thumbnail = models.CharField(max_length=100,null=True)
    keywords = models.CharField(max_length=200,null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class File(models.Model):
    name = models.CharField(max_length=200,null=True)
    filename = models.CharField(max_length=100,null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class Meeting(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200)
    date_start = models.DateField()
    date_end = models.DateField()
    registration_deadline = models.DateField(null=True,blank=True)
    abstract_deadline = models.DateField(null=True,blank=True)
    url = models.URLField(null=True,blank=True)
    topic = models.CharField(max_length=500,null=True,blank=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.name

class Job(models.Model):
    title = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    deadline = models.DateField(null=True)
    description = models.CharField(max_length=1000,null=True)
    url = models.URLField(null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title

class Grant(models.Model):
    title = models.CharField(max_length=100)
    agency = models.CharField(max_length=100)
    deadline = models.DateField(null=True)
    description = models.CharField(max_length=1000,null=True)
    url = models.URLField(null=True)
    last_modified_date = models.DateTimeField(
            blank=True, null=True)

    def publish(self):
        self.last_modified_date = timezone.now()
        self.save()

    def __str__(self):
        return self.title
