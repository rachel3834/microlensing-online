# -*- coding: utf-8 -*-
# Generated by Django 1.9.8 on 2016-11-03 23:52
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tutorial', '0010_auto_20161103_1650'),
    ]

    operations = [
        migrations.AddField(
            model_name='tutorialpage',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='tutorial.Author'),
        ),
    ]
