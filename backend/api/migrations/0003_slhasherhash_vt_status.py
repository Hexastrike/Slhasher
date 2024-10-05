# Generated by Django 4.2.14 on 2024-09-22 08:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_rename_hash_sha256_slhasherhash_slhasher_hash'),
    ]

    operations = [
        migrations.AddField(
            model_name='slhasherhash',
            name='vt_status',
            field=models.CharField(choices=[('error', 'Error'), ('unknown', 'Unknown'), ('success', 'Success')], default='unknown', max_length=7),
        ),
    ]
