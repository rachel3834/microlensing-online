from django.shortcuts import render
from .models import *
from django.views.generic.detail import DetailView

def home(request):
    pages = TutorialPage.objects.all()
    return render(request,'tutorial/index.html',{'pages':pages})

class TutorialDetails(DetailView):
    model = TutorialPage
    template_name = 'tutorial/tutorial_page.html'