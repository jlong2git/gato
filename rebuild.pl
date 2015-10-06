#!/usr/bin/perl
use strict;
use Cwd;

our $gatodir = cwd();
our $tomcatdir = $gatodir."/tomcat";
our $urlbase = "http://localhost:8080";
our $backupdir = "$gatodir/../gatobackup";
our $edgewarpath = "$gatodir/gato-webapp/target/gato-webapp*war";
our $magrepopath = "/var/mag_repositories";
our $magnoliapropertiespath = "/etc/magnolia/config";
our @lightmodules = ('gato-template', 'gato-template-tsus', 'gato-template-txstate2015');
our @heavymodules = ('gato-lib', 'gato-internal', 'gato-component-cssjs', 'gato-component-dept-directory', 
  'gato-component-faq', 'gato-component-gallery', 'gato-component-documents', 'gato-component-table');
our @sassfiles = ('resources/gato-template-tsus/css/tsus-home.scss', 
                  'resources/gato-template-blank/css/blank.scss',
                  'resources/gato-template-txstate2015/css/txstate2015.scss',
                  'resources/gato-template-txstate2009/css/standard.scss');
our $module = "";

# place your local overrides in the root gato directory in a file named "rebuild_vars.pl"
# git will ignore the file
if (-e "$gatodir/rebuild_vars.pl") { require("$gatodir/rebuild_vars.pl"); }

if ($ARGV[0] eq '--module') {
  $module = $ARGV[1];
  buildmodule($module);
  tomcat_restart(sub {
    replacemodule($module);
  });
} elsif ($ARGV[0] eq '--restart') {
  tomcat_restart();
} elsif ($ARGV[0] eq '--resources') {
  if (setmagnoliaresourcespath()) {
    symlinkheavyresources();
  }
} elsif ($ARGV[0] eq '--sass') {
  symlinkheavyresources();
  sass();
} elsif ($ARGV[0] eq '--reset') {
  resetdata();
} elsif ($ARGV[0] eq '--backup') {
  backupmagrepositories();
  backupmysql();
} elsif ($ARGV[0] eq '--restore') {
    restoredata();
} elsif ($ARGV[0] eq '--dry') {
  buildedge();
  tomcat_restart(sub {
    restoredata();
    cleanwebapp();
    installwar($edgewarpath);
  });
  triggerbootstrap();
} else {
  buildedge();
  tomcat_restart(sub {
    cleanwebapp();
    installwar($edgewarpath);
  });
  triggerbootstrap();
}

print "Done.\n";


sub tomcat_restart {
  my $nested = shift;
  
  print "stopping tomcat...\n";
  my $pid = `pgrep -f $tomcatdir`;
  `kill $pid` if $pid > 0;

  my $matchstr = quotemeta($tomcatdir);
  while (`ps ax` =~ m/$matchstr/) {
    print "waiting for tomcat to go away...\n";
    sleep(1);
  }
  
  print "wiping out the cache directory so our CSS/JS gets reloaded...\n";
  `rm -rf $tomcatdir/webapps/ROOT/cache`;
  
  $nested->() if $nested;
  
  print "starting tomcat...\n";
  `$tomcatdir/bin/startup.sh`;
}

sub setmagnoliaresourcespath() {
  my $success = 0;
  print "creating magnolia properties file to point resources at git repo...\n";
  `mkdir -p $magnoliapropertiespath`;
  open(my $fh, '>', "$magnoliapropertiespath/magnolia.properties") or warn $!;
  if (-w $fh) {
    print $fh "magnolia.resources.dir=$gatodir/resources\n";
    print $fh "magnolia.develop=true\n";
    $success = 1;
  } else {
    print "Need write permission, try sudo.\n";
  }
  close($fh);
  return $success;
}

sub symlinkheavyresources {
  print "symlinking heavy modules into $gatodir/resources...\n";
  foreach my $hm (@heavymodules) {
    `ln -s $gatodir/$hm/src/main/resources/$hm $gatodir/resources/$hm` unless -e "$gatodir/resources/$hm";
  }
}

sub resetdata {
  print "resetting all data...\n";
  `mysql -u root -e "DROP DATABASE IF EXISTS magnolia; CREATE DATABASE magnolia"`;
  `rm -rf $magrepopath/magnolia`;
}

sub restoredata {
  resetdata();
  restoremagrepositories();
  restoremysql();
}

sub cleanwebapp {
  print "removing old webapp...\n";
  `rm -rf $tomcatdir/webapps/ROOT*`;
}

sub buildedge {
  symlinkheavyresources();
  sass();
  print "building full war...\n";
  chdir($gatodir);
  my $output = `mvn clean package`;
  if ($output =~ m/FAILURE|ERROR/) { print $output."\n"; exit; }
}

sub installwar {
  my $warpath = shift;
  print "copying war...\n";
  `cp $warpath $tomcatdir/webapps/ROOT.war`;
}

sub buildmodule {
  my $module = shift;
  print "building individual module $module...\n";
  chdir($gatodir.'/'.$module);
  `mvn install package`;
}

sub replacemodule {
  my $module = shift;
  print "removing old $module jar...\n";
  `rm $tomcatdir/webapps/ROOT/WEB-INF/lib/$module*.jar`;
  print "copying new $module jar to webapp...\n";
  `cp $gatodir/$module/target/$module*.jar $tomcatdir/webapps/ROOT/WEB-INF/lib/`;
}

sub triggerbootstrap() {
  print "initiating upgrade tasks...\n";
  sleep(10);
  `curl $urlbase/.magnolia/installer > /dev/null`;
  `curl $urlbase/.magnolia/installer/start > /dev/null`;  
}

sub waitforbootstrap() {
  print "waiting for bootstrap process to finish...\n";
  sleep(80);
}

sub backupmagrepositories {
  print "copying current mag_repositories folder to $backupdir...\n";
  `rm -rf $backupdir/magnolia`;
  `cp -R $magrepopath/magnolia $backupdir/magnolia`;
}

sub backupmysql {
  print "archiving mysql database 'magnolia'...\n";
  `mysqldump -u root --add-drop-table --extended-insert magnolia > $backupdir/magnolia.sql`
}

sub restoremagrepositories {
  print "copying backed up mag_repositories folder into place...\n";
  `cp -R $backupdir/magnolia $magrepopath/magnolia`;
}

sub restoremysql {
  print "restoring mysql data...\n";
  `mysql -u root magnolia < $backupdir/magnolia.sql`;
}

# assumes `sass` is available on your system
sub sass {
  print "Compiling SASS files...\n";  
  my $loadpaths = '--load-path '.$gatodir.'/resources';
  
  foreach my $file (@sassfiles) {
    my $input = "$gatodir/$file";
    my $output = $input;
    $output =~ s/.scss$/.compiled.css/i;
    `sass $loadpaths "$file" "$output"`;
    `rm $output.map`;
  }
}
