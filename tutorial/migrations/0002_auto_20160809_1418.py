# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-08-09 21:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tutorial', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tutorialpage',
            name='course_index',
            field=models.IntegerField(null=True),
        ),
        migrations.AddField(
            model_name='tutorialpage',
            name='short_title',
            field=models.CharField(max_length=20, null=True),
        ),
    ]
