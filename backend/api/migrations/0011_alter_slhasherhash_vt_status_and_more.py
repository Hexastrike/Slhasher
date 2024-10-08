# Generated by Django 4.2.14 on 2024-10-03 21:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_alter_slhasherhash_vt_status_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='slhasherhash',
            name='vt_status',
            field=models.CharField(choices=[('unknown', 'Unknown'), ('success', 'Success'), ('pending', 'Pending'), ('error', 'Error')], default='pending', max_length=7),
        ),
        migrations.AlterField(
            model_name='slhasherquery',
            name='query_status',
            field=models.CharField(choices=[('unknown', 'Unknown'), ('success', 'Success'), ('pending', 'Pending'), ('error', 'Error')], default='pending', max_length=7),
        ),
    ]
