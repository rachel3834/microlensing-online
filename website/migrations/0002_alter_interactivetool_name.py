# Generated by Django 4.0.3 on 2022-03-03 23:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('website', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='interactivetool',
            name='name',
            field=models.CharField(max_length=50),
        ),
    ]
