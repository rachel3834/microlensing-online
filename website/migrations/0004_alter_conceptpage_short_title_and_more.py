# Generated by Django 4.0.3 on 2022-03-04 00:14

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0003_alter_author_affiliation_alter_author_name'),
    ]

    operations = [
        migrations.AlterField(
            model_name='conceptpage',
            name='short_title',
            field=models.CharField(max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='tutorialpage',
            name='short_title',
            field=models.CharField(max_length=100, null=True),
        ),
    ]
