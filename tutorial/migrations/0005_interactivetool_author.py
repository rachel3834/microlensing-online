# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-19 18:45
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('tutorial', '0004_interactivetool_title'),
    ]

    operations = [
        migrations.AddField(
            model_name='interactivetool',
            name='author',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='tutorial.Author'),
        ),
    ]
