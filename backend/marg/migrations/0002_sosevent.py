from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('marg', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SOSEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=7, max_digits=10, null=True)),
                ('audio', models.FileField(blank=True, upload_to='sos_audio/%Y/%m/')),
                ('note', models.TextField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sos_events', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
