# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-12-05 00:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tutorial', '0015_tutorialpage_references'),
    ]

    operations = [
        migrations.AddField(
            model_name='reference',
            name='search_key',
            field=models.CharField(default=None, max_length=200),
            preserve_default=False,
        ),
    ]
