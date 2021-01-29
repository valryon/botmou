
echo "Archiving"

git archive --format zip --output ./botmou.zip master
git archive --format zip --output ./gdfr.zip gdfr

echo "Uploading"

scp -r botmou.zip valryon@proto.headbang.club:/tmp
scp -r gdfr.zip valryon@proto.headbang.club:/tmp

echo "Cleaning"

del botmou.zip
del gdfr.zip

echo "Ready to deploy."

pause