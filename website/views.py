from django.shortcuts import render
from .models import *
from django.views.generic.detail import DetailView
from django.core.exceptions import ObjectDoesNotExist
from datetime import datetime
from django.http import HttpResponse

def home(request):
    return render(request,'website/index.html',{})

def contact(request):
    return render(request,'website/site_contact.html',{})

def license(request):
    return render(request,'website/site_license.html',{})

def overview(request):
    return render(request,'website/overview.html',{})

def learning(request):
    return render(request,'website/learning.html',{})

def resources(request):
    return render(request,'website/resources.html',{})

def opportunities(request,selected='none'):
    meetings = []
    jobs = []
    grants = []

    if selected == 'meetings':
        meetings = Meeting.objects.filter(date_end__gte=datetime.utcnow()).order_by('date_end')
    elif selected == 'jobs':
        jobs = Job.objects.filter(deadline__gte=datetime.utcnow()).order_by('deadline')
    elif selected == 'grants':
        grants = Grant.objects.filter(deadline__gte=datetime.utcnow()).order_by('deadline')

    return render(request,'website/opportunities.html',{'meetings_list':meetings,
                                                         'jobs_list':jobs,
                                                         'grants_list':grants,
                                                         'selected':selected})

def references(request):
    refs = Reference.objects.all()
    ref_list = []
    indices = []
    for r in refs:
        ref_list.append(r.__str__())
        indices.append(r.authors)
    index = list(zip(indices,ref_list))
    index.sort()
    (indices, ref_list) = zip(*index)
    return render(request,'website/references.html',{'reference_list':ref_list})

def links(request):
    space_surveys = OnlineResource.objects.filter(group__contains='space-based mission')
    ground_surveys = OnlineResource.objects.filter(group__contains='ground-based survey')
    ground_followup = OnlineResource.objects.filter(group__contains='ground-based follow-up')
    sagan_workshop = OnlineResource.objects.filter(group__contains='sagan workshop 2017')
    meetings = OnlineResource.objects.filter(group__contains='meetings').order_by('name')
    youtube = OnlineResource.objects.filter(group__contains='youtube').order_by('name')
    simulations = OnlineResource.objects.filter(group__contains='simulations')

    return render(request,'website/links.html',{'space_surveys':space_surveys, \
                                                'ground_surveys':ground_surveys, \
                                                'ground_followup':ground_followup,\
                                                'sagan_workshop':sagan_workshop,\
                                                'meetings': meetings,\
                                                'youtube': youtube,\
                                                'simulations': simulations,
                                                })

def get_article_db_entries(page):

    tables = {'REF': Reference, 'URL': OnlineResource, \
                'MOVIE': Movie, 'PICTURE': Picture, \
                'SITEPAGE': SitePage, 'CONCEPTPAGE': ConceptPage, \
                'TUTORIALPAGE': TutorialPage, 'INTERACTIVETOOL': InteractiveTool,\
                'FILE': File}
    text = []
    dbentries = []
    references = []
    lines = page.text
    lines = lines.split('\n')
    for line in lines:
        if 'DBENTRY' in line:
            l = line.replace('\n','').split(' ')
            idb = l[0]
            table = l[1]
            pk = int(l[2])
            entry = {}
            if table == 'REF':
                entry['type'] = 'REF'
                entry['object'] = Reference.objects.get(pk=pk)
                references.append(entry['object'])
            elif table == 'URL':
                entry['type'] = 'URL'
                entry['object'] = OnlineResource.objects.get(pk=pk)
            elif table == 'MOVIE':
                entry['type'] = 'MOVIE'
                entry['object'] = Movie.objects.get(pk=pk)
            elif table == 'PICTURE':
                entry['type'] = 'PICTURE'
                entry['object'] = Picture.objects.get(pk=pk)
            elif table == 'FILE':
                entry['type'] = 'FILE'
                entry['object'] = File.objects.get(pk=pk)
                line = line.split('::')[-2].split('=')[-1]
            elif table == 'SITELINK':
                dbtable = l[3].replace('::','').split('=')[1]
                linktext = line.split('::')[-2].split('=')[-1]
                entry['type'] = dbtable
                if dbtable == 'SITEPAGE':
                    entry['object'] = SitePage.objects.get(pk=pk)
                elif dbtable == 'CONCEPTPAGE':
                    entry['object'] = ConceptPage.objects.get(pk=pk)
                elif dbtable == 'TUTORIALPAGE':
                    entry['object'] = TutorialPage.objects.get(pk=pk)
                elif dbtable == 'INTERACTIVETOOL':
                    entry['object'] = InteractiveTool.objects.get(pk=pk)
                line = linktext
            dbentries.append( entry )
        else:
            dbentries.append( 'no_db_entry' )
        text.append( line )
    content = zip(text,dbentries)

    return page, content, references

def page(request):
    page_name = str(request.path_info).replace('/','')
    try:
        page = SitePage.objects.get(name=page_name)
        page,content,references = get_article_db_entries(page)
        return render(request,'website/site_page.html',{'page':page,\
                    'content':content,'references':references})
    except SitePage.DoesNotExist:
        return render(request,'website/site_404.html',{})
