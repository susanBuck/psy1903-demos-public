#!/bin/sh

git push

ssh forge@45.79.155.61 "cd demos.psy1903.com; git pull"
