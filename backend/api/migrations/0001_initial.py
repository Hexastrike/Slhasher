# Generated by Django 4.2.14 on 2024-09-13 20:13

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='QueryHashJoin',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query_id', models.CharField(max_length=64)),
                ('hash_id', models.CharField(max_length=64)),
            ],
        ),
        migrations.CreateModel(
            name='SlhasherHash',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hash_sha256', models.CharField(max_length=64)),
                ('vt_meta', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='SlhasherQuery',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('query_analyst', models.CharField(max_length=128)),
                ('query_case_name', models.CharField(max_length=256)),
                ('query_date', models.DateField()),
            ],
        ),
    ]
