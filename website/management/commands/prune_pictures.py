
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from website.models import Movie, Picture

class Command(BaseCommand):
    args = ''
    help = ''

    def _remove_old_entries(self):
        picture_list = Picture.objects.all()

        for image in picture_list:
            if len(image.thumbnail) > 0:
                extn = image.thumbnail.split('.')[-1]
                if extn != 'png':
                    image.delete()

    def handle(self,*args, **options):
        self._remove_old_entries()
