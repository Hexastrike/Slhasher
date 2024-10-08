# Generated by Django 4.2.14 on 2024-10-03 11:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_slhasherquery_query_status_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slhasherhash',
            name='vt_status',
            field=models.CharField(choices=[('unknown', 'Unknown'), ('error', 'Error'), ('pending', 'Pending'), ('success', 'Success')], default='pending', max_length=7),
        ),
        migrations.AlterField(
            model_name='slhasherquery',
            name='query_status',
            field=models.CharField(choices=[('unknown', 'Unknown'), ('error', 'Error'), ('pending', 'Pending'), ('success', 'Success')], default='pending', max_length=7),
        ),
    ]
