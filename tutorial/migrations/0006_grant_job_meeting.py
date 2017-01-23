# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-01-20 18:40
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tutorial', '0005_interactivetool_author'),
    ]

    operations = [
        migrations.CreateModel(
            name='Grant',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('agency', models.CharField(max_length=100)),
                ('deadline', models.DateField(null=True)),
                ('description', models.CharField(max_length=1000, null=True)),
                ('url', models.URLField(null=True)),
                ('last_modified_date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('location', models.CharField(max_length=100)),
                ('deadline', models.DateField(null=True)),
                ('description', models.CharField(max_length=1000, null=True)),
                ('url', models.URLField(null=True)),
                ('last_modified_date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Meeting',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('location', models.CharField(max_length=200)),
                ('date', models.DateField()),
                ('registration_deadline', models.DateField(null=True)),
                ('abstract_deadline', models.DateField(null=True)),
                ('url', models.URLField(null=True)),
                ('topic', models.CharField(max_length=500, null=True)),
                ('last_modified_date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]
