# Generated by Django 3.0.8 on 2020-10-22 11:35

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('meetings', '0005_delete_infracategory'),
    ]

    operations = [
        migrations.CreateModel(
            name='Stream',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('meeting_name', models.CharField(max_length=1000)),
                ('meeting_link', models.CharField(max_length=1000)),
                ('meeting_id', models.CharField(max_length=1000)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('bbb_server', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='meetings.BBBServer')),
                ('broadcast_pod', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='meetings.BBBBroadcastPod')),
                ('stream_origin', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='meetings.StreamOrigin')),
            ],
        ),
        migrations.CreateModel(
            name='ActivityLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event', models.CharField(choices=[(1, 'Logged In'), (2, 'Logged Out'), (3, 'Stream Started'), (4, 'Stream Stopped')], max_length=2)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('stream', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='meetings.Stream')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
