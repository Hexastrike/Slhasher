# Generated by Django 4.2.14 on 2024-09-22 11:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alter_slhasherhash_vt_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='slhasherquery',
            name='query_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('error', 'Error'), ('unknown', 'Unknown')], default='pending', max_length=7),
        ),
        migrations.AlterField(
            model_name='slhasherhash',
            name='vt_status',
            field=models.CharField(choices=[('pending', 'Pending'), ('success', 'Success'), ('error', 'Error'), ('unknown', 'Unknown')], default='pending', max_length=7),
        ),
    ]