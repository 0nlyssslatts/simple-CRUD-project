from django.shortcuts import render
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.urls import reverse
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from json import loads
from CRUDApp.models import User, Notes
# Create your views here.

def register(request):
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']
        confirmation = request.POST['confirmation']
        if password != confirmation:
            return render(request, "CRUDApp/register.html", {
                "message":"Password must match."
            })
        
        try:
            user = User.objects.create_user(username=email, password = password)
            user.save()
        except IntegrityError:
            return render(request, "CRUDApp/register.html", {
                "message":"User with the entered email already exists."
            })
        
        login(request, user)

        return HttpResponseRedirect(reverse("index"))
    
    return render(request, 'CRUDApp/register.html')

def login_view(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = authenticate(request, username=email, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "CRUDApp/register.html", {
                "message":"Invalid email and/or password."
            }) 
    
    return render(request, 'CRUDApp/login.html')

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse('login'))


@login_required(login_url='/login/')
def index(request):
    return render(request, 'CRUDApp/index.html')


@login_required(login_url='/login/')
@csrf_exempt
def notes(request):
    if request.method =='GET':
        try:
            user = request.user
            notes = user.notes.all()
            note_list = []
            for i in notes:
                note = {
                    'id': i.id,
                    'title': i.title,
                    'note': i.note,
                    'created_at': i.created_at,
                    'updated_at': i.updated_at
                }
                note_list.append(note)

            return JsonResponse({
                'status': 0,
                'notes': note_list
            })
        except:
            return JsonResponse({
                'status': 1,
            })
            
    try:
        note = loads(request.body)
        title = note['title']
        content = note['content']
        user = request.user
        note_object = Notes.objects.create(user=user, title=title, note = content)
        note_object.save()
        return JsonResponse({'status':0})
    except:
        return JsonResponse({'status':1})
    

@login_required(login_url='/login/')
@csrf_exempt
def edit(request):
    if request.method == 'POST':
        try:
            note_edit = loads(request.body)
            note = Notes.objects.get(id=note_edit['id'])
            note.title = note_edit['title']
            note.note = note_edit['content']
            note.save()
            return JsonResponse({'status': 0})
        except:
            return JsonResponse({'status': 1})


@login_required(login_url='/login/')
@csrf_exempt
def delete(request):
    if request.method == 'POST':
        try:
            note_del = loads(request.body)
            note_id = note_del['id']
            note = Notes.objects.filter(id=note_id)
            if len(note) != 0:
                note.delete()
            return JsonResponse({'status': 0})
        except:
            return JsonResponse({'status': 1})
        
